import { useState } from "react";
import { Button, Chip } from "@heroui/react";
import {
    Building2,
    CalendarClock,
    Hash,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Star,
    Trash2,
} from "lucide-react";
import {
    useDeleteSenderProfile,
    useSenderProfiles,
} from "@/features/sender-profiles/hooks/use-sender-profiles";
import type { SenderProfile } from "@/features/sender-profiles/interfaces/sender-profile.interface";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SenderProfileFormModal } from "./components/sender-profile-form-modal";

export default function SenderProfilesPage() {
    const { data: profiles, isLoading } = useSenderProfiles();
    const deleteProfile = useDeleteSenderProfile();

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<SenderProfile | null>(null);
    const [toDelete, setToDelete] = useState<SenderProfile | null>(null);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (profile: SenderProfile) => {
        setEditing(profile);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        try {
            await deleteProfile.mutateAsync(toDelete.uuid);
            setToDelete(null);
        } catch {
            // toast surfaced by hook
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-foreground">
                        Sender profiles
                    </h1>
                    <p className="text-sm text-muted max-w-xl">
                        Identities used in your outreach footers. Add one profile per
                        company or persona — pick which one to use later when you draft a
                        message.
                    </p>
                </div>
                <Button onPress={openCreate}>
                    <Plus className="size-4" />
                    New profile
                </Button>
            </header>

            {isLoading ? (
                <SkeletonGrid />
            ) : !profiles || profiles.length === 0 ? (
                <EmptyState onCreate={openCreate} />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {profiles.map((profile) => (
                        <ProfileCard
                            key={profile.uuid}
                            profile={profile}
                            onEdit={() => openEdit(profile)}
                            onDelete={() => setToDelete(profile)}
                        />
                    ))}
                </div>
            )}

            <SenderProfileFormModal
                isOpen={formOpen}
                onOpenChange={setFormOpen}
                profile={editing}
            />

            <ConfirmDialog
                isOpen={!!toDelete}
                onOpenChange={(open) => {
                    if (!open) setToDelete(null);
                }}
                title="Delete sender profile?"
                description={
                    toDelete ? (
                        <>
                            This will permanently remove{" "}
                            <span className="font-medium text-foreground">
                                {toDelete.name}
                            </span>
                            . You can recreate it any time.
                        </>
                    ) : null
                }
                confirmLabel="Delete"
                variant="danger"
                isPending={deleteProfile.isPending}
                onConfirm={handleDelete}
            />
        </div>
    );
}

interface ProfileCardProps {
    profile: SenderProfile;
    onEdit: () => void;
    onDelete: () => void;
}

function ProfileCard({ profile, onEdit, onDelete }: ProfileCardProps) {
    const personName = [profile.first_name, profile.last_name]
        .filter(Boolean)
        .join(" ");
    const locationLine = [profile.city, profile.country]
        .filter(Boolean)
        .join(", ");

    return (
        <article className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3">
                <Logo url={profile.logo_url} fallback={profile.name} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                            {profile.name}
                        </h3>
                        {profile.is_default && (
                            <Chip size="sm" variant="soft" color="success">
                                <Star className="size-3" />
                                <Chip.Label>Default</Chip.Label>
                            </Chip>
                        )}
                    </div>
                    {profile.company_name && (
                        <p className="text-xs text-muted truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="size-3 shrink-0" />
                            {profile.company_name}
                        </p>
                    )}
                    {personName && (
                        <p className="text-xs text-muted truncate mt-0.5">
                            {personName}
                            {profile.title ? ` · ${profile.title}` : ""}
                        </p>
                    )}
                </div>
            </div>

            <dl className="space-y-1.5 text-xs">
                {profile.email && (
                    <Row icon={Mail} value={profile.email} />
                )}
                {profile.phone && <Row icon={Phone} value={profile.phone} />}
                {profile.booking_url && (
                    <Row
                        icon={CalendarClock}
                        value={
                            <a
                                href={profile.booking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate hover:underline"
                            >
                                {profile.booking_url}
                            </a>
                        }
                    />
                )}
                {locationLine && <Row icon={MapPin} value={locationLine} />}
                {profile.sender_id && (
                    <Row
                        icon={Hash}
                        value={
                            <span>
                                <span className="text-muted">SMS:</span>{" "}
                                <span className="font-mono">{profile.sender_id}</span>
                            </span>
                        }
                    />
                )}
            </dl>

            <div className="flex items-center gap-2 pt-1 border-t border-border">
                <Button size="sm" variant="secondary" onPress={onEdit}>
                    <Pencil className="size-3.5" />
                    Edit
                </Button>
                <Button size="sm" variant="ghost" onPress={onDelete}>
                    <Trash2 className="size-3.5" />
                    Delete
                </Button>
            </div>
        </article>
    );
}

function Row({
    icon: Icon,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-2 text-muted">
            <Icon className="size-3.5 shrink-0" />
            <span className="truncate text-foreground/80">{value}</span>
        </div>
    );
}

function Logo({ url, fallback }: { url: string | null; fallback: string }) {
    const [broken, setBroken] = useState(false);
    if (url && !broken) {
        return (
            <img
                src={url}
                alt={`${fallback} logo`}
                onError={() => setBroken(true)}
                className="h-10 w-10 rounded-lg object-contain bg-surface-secondary border border-border shrink-0"
            />
        );
    }
    const initials = fallback
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("");
    return (
        <div className="h-10 w-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center text-sm font-semibold shrink-0">
            {initials || "?"}
        </div>
    );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="rounded-xl border border-dashed border-border bg-surface-secondary/40 p-10 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                <Building2 className="size-6" />
            </div>
            <div className="space-y-1">
                <h2 className="text-base font-semibold text-foreground">
                    No sender profiles yet
                </h2>
                <p className="text-sm text-muted max-w-md mx-auto">
                    Create a profile so the AI stops leaving placeholder fields like
                    “[full name]” or “[address]” in your messages.
                </p>
            </div>
            <Button onPress={onCreate}>
                <Plus className="size-4" />
                Add your first profile
            </Button>
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border border-border bg-surface p-4 space-y-3 animate-pulse"
                >
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-surface-secondary" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/2 rounded bg-surface-secondary" />
                            <div className="h-3 w-1/3 rounded bg-surface-secondary" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-2/3 rounded bg-surface-secondary" />
                        <div className="h-3 w-1/2 rounded bg-surface-secondary" />
                    </div>
                </div>
            ))}
        </div>
    );
}
