import { useEffect, useState } from "react";
import {
    Button,
    FieldError,
    Input,
    Label,
    Modal,
    Switch,
    TextArea,
} from "@heroui/react";
import { Save } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import {
    useCreateSenderProfile,
    useUpdateSenderProfile,
} from "@/features/sender-profiles/hooks/use-sender-profiles";
import type {
    CreateSenderProfilePayload,
    SenderProfile,
    UtmParams,
} from "@/features/sender-profiles/interfaces/sender-profile.interface";

type UtmPrefix = "website" | "booking";

const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;
type UtmKey = (typeof UTM_KEYS)[number];
type UtmFormKey = `${UtmPrefix}_utm_${UtmKey}`;

function utmFormKey(prefix: UtmPrefix, key: UtmKey): UtmFormKey {
    return `${prefix}_utm_${key}`;
}

function utmFromProfile(utm: UtmParams | null | undefined, prefix: UtmPrefix): Pick<FormState, UtmFormKey> {
    return {
        [utmFormKey(prefix, "source")]: utm?.source ?? "",
        [utmFormKey(prefix, "medium")]: utm?.medium ?? "",
        [utmFormKey(prefix, "campaign")]: utm?.campaign ?? "",
        [utmFormKey(prefix, "term")]: utm?.term ?? "",
        [utmFormKey(prefix, "content")]: utm?.content ?? "",
    } as Pick<FormState, UtmFormKey>;
}

function buildUtmPayload(
    form: FormState,
    prefix: UtmPrefix,
    isEdit: boolean,
): UtmParams | null | undefined {
    const utm: UtmParams = {
        source: form[utmFormKey(prefix, "source")].trim(),
        medium: form[utmFormKey(prefix, "medium")].trim(),
        campaign: form[utmFormKey(prefix, "campaign")].trim(),
        term: form[utmFormKey(prefix, "term")].trim(),
        content: form[utmFormKey(prefix, "content")].trim(),
    };
    const hasAny = Object.values(utm).some(Boolean);
    if (!hasAny) {
        return isEdit ? null : undefined;
    }
    return Object.fromEntries(
        Object.entries(utm).filter(([, value]) => Boolean(value)),
    ) as UtmParams;
}

function UtmFieldsGroup({
    prefix,
    title,
    form,
    set,
}: {
    prefix: UtmPrefix;
    title: string;
    form: FormState;
    set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
    const labels: Record<UtmKey, string> = {
        source: "Source",
        medium: "Medium",
        campaign: "Campaign",
        term: "Term",
        content: "Content",
    };
    const placeholders: Record<UtmKey, string> = {
        source: "email",
        medium: "outreach",
        campaign: "optional label",
        term: "ceo",
        content: "cta-footer",
    };

    return (
        <div className="rounded-lg border border-border bg-surface-secondary/30 p-3 space-y-3">
            <p className="text-xs font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted">
                Campaign ID is added automatically when a marketing campaign sends. Other
                fields apply to every link.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
                {UTM_KEYS.map((key) => {
                    const field = utmFormKey(prefix, key);
                    return (
                        <div key={field} className="flex flex-col gap-1.5">
                            <Label htmlFor={`sp-${field}`}>{labels[key]}</Label>
                            <Input
                                id={`sp-${field}`}
                                placeholder={placeholders[key]}
                                value={form[field]}
                                onChange={(e) => set(field, e.target.value)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface SenderProfileFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    profile?: SenderProfile | null;
}

type FormState = {
    name: string;
    company_name: string;
    title: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    country: string;
    logo_url: string;
    booking_url: string;
    sender_id: string;
    signature: string;
    business_description: string;
    is_default: boolean;
} & Record<UtmFormKey, string>;

const emptyUtmFields = (): Record<UtmFormKey, string> =>
    Object.fromEntries(
        (["website", "booking"] as UtmPrefix[]).flatMap((prefix) =>
            UTM_KEYS.map((key) => [utmFormKey(prefix, key), ""]),
        ),
    ) as Record<UtmFormKey, string>;

const emptyForm = (): FormState => ({
    name: "",
    company_name: "",
    title: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    country: "",
    logo_url: "",
    booking_url: "",
    sender_id: "",
    signature: "",
    business_description: "",
    is_default: false,
    ...emptyUtmFields(),
});

const fromProfile = (p: SenderProfile): FormState => ({
    name: p.name ?? "",
    company_name: p.company_name ?? "",
    title: p.title ?? "",
    first_name: p.first_name ?? "",
    last_name: p.last_name ?? "",
    email: p.email ?? "",
    phone: p.phone ?? "",
    website: p.website ?? "",
    address: p.address ?? "",
    city: p.city ?? "",
    country: p.country ?? "",
    logo_url: p.logo_url ?? "",
    booking_url: p.booking_url ?? "",
    sender_id: p.sender_id ?? "",
    signature: p.signature ?? "",
    business_description: p.business_description ?? "",
    is_default: p.is_default,
    ...utmFromProfile(p.website_utm, "website"),
    ...utmFromProfile(p.booking_utm, "booking"),
});

export function SenderProfileFormModal({
    isOpen,
    onOpenChange,
    profile,
}: SenderProfileFormModalProps) {
    const createProfile = useCreateSenderProfile();
    const updateProfile = useUpdateSenderProfile();

    const isEdit = !!profile;
    const isPending = createProfile.isPending || updateProfile.isPending;

    const [form, setForm] = useState<FormState>(emptyForm());
    const [error, setError] = useState<string | null>(null);
    const [logoBroken, setLogoBroken] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        setLogoBroken(false);
        setForm(profile ? fromProfile(profile) : emptyForm());
    }, [isOpen, profile]);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const name = form.name.trim();
        if (!name) {
            setError("Profile name is required.");
            return;
        }

        const stringKeys = [
            "company_name",
            "title",
            "first_name",
            "last_name",
            "email",
            "phone",
            "website",
            "address",
            "city",
            "country",
            "logo_url",
            "booking_url",
            "sender_id",
            "signature",
            "business_description",
        ] as const satisfies readonly (keyof FormState)[];

        const payload: CreateSenderProfilePayload = {
            name,
            is_default: form.is_default,
        };
        for (const key of stringKeys) {
            const v = form[key].trim();
            if (v) {
                (payload as unknown as Record<string, unknown>)[key] = v;
            }
        }

        const websiteUtm = buildUtmPayload(form, "website", isEdit);
        if (websiteUtm !== undefined) {
            payload.website_utm = websiteUtm;
        }
        const bookingUtm = buildUtmPayload(form, "booking", isEdit);
        if (bookingUtm !== undefined) {
            payload.booking_utm = bookingUtm;
        }

        try {
            if (isEdit && profile) {
                await updateProfile.mutateAsync({
                    uuid: profile.uuid,
                    payload,
                });
            } else {
                await createProfile.mutateAsync(payload);
            }
            onOpenChange(false);
        } catch {
            // toast surfaced by hooks
        }
    };

    const logoUrl = form.logo_url.trim();

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>
                            {isEdit ? "Edit sender profile" : "New sender profile"}
                        </Modal.Heading>
                    </Modal.Header>
                    <form
                        onSubmit={handleSubmit}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <Modal.Body className="p-6 space-y-6">
                            <section className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Identity
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <Label htmlFor="sp-name">
                                            Profile name <span className="text-danger">*</span>
                                        </Label>
                                        <Input
                                            id="sp-name"
                                            placeholder="e.g. Acme Marketing"
                                            value={form.name}
                                            onChange={(e) => set("name", e.target.value)}
                                            required
                                        />
                                        <p className="text-xs text-muted">
                                            Internal label so you can recognise this profile.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <Label htmlFor="sp-company">Company name</Label>
                                        <Input
                                            id="sp-company"
                                            placeholder="Acme Inc"
                                            value={form.company_name}
                                            onChange={(e) =>
                                                set("company_name", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="sp-first">First name</Label>
                                        <Input
                                            id="sp-first"
                                            placeholder="Jane"
                                            value={form.first_name}
                                            onChange={(e) =>
                                                set("first_name", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="sp-last">Last name</Label>
                                        <Input
                                            id="sp-last"
                                            placeholder="Doe"
                                            value={form.last_name}
                                            onChange={(e) =>
                                                set("last_name", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <Label htmlFor="sp-title">Title</Label>
                                        <Input
                                            id="sp-title"
                                            placeholder="Head of Sales"
                                            value={form.title}
                                            onChange={(e) => set("title", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 sm:col-span-2 rounded-lg border border-border bg-surface-secondary/40 px-3 py-2.5">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                Default profile
                                            </p>
                                            <p className="text-xs text-muted">
                                                Highlight this one as the preferred profile in the
                                                list.
                                            </p>
                                        </div>
                                        <Switch
                                            isSelected={form.is_default}
                                            onChange={(v) =>
                                                set("is_default", typeof v === "boolean" ? v : !form.is_default)
                                            }
                                            aria-label="Set as default profile"
                                        >
                                            <Switch.Control>
                                                <Switch.Thumb />
                                            </Switch.Control>
                                        </Switch>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Contact
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="sp-email">Email</Label>
                                        <Input
                                            id="sp-email"
                                            type="email"
                                            placeholder="jane@acme.com"
                                            value={form.email}
                                            onChange={(e) => set("email", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="sp-phone">Phone</Label>
                                        <Input
                                            id="sp-phone"
                                            placeholder="+1 555 0100"
                                            value={form.phone}
                                            onChange={(e) => set("phone", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2 space-y-3">
                                        <Label htmlFor="sp-website">Website</Label>
                                        <Input
                                            id="sp-website"
                                            placeholder="acme.com"
                                            value={form.website}
                                            onChange={(e) => set("website", e.target.value)}
                                        />
                                        <UtmFieldsGroup
                                            prefix="website"
                                            title="Website UTM tracking (optional)"
                                            form={form}
                                            set={set}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2 space-y-3">
                                        <Label htmlFor="sp-booking">Booking URL</Label>
                                        <Input
                                            id="sp-booking"
                                            placeholder="https://cal.com/jane/intro"
                                            value={form.booking_url}
                                            onChange={(e) =>
                                                set("booking_url", e.target.value)
                                            }
                                        />
                                        <p className="text-xs text-muted">
                                            Calendly / Cal.com / similar link used by the AI as the
                                            "book a call" CTA in outreach.
                                        </p>
                                        <UtmFieldsGroup
                                            prefix="booking"
                                            title="Booking URL UTM tracking (optional)"
                                            form={form}
                                            set={set}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Address
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <Label htmlFor="sp-address">Street address</Label>
                                        <Input
                                            id="sp-address"
                                            placeholder="123 Main St, Suite 100"
                                            value={form.address}
                                            onChange={(e) => set("address", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="sp-city">City</Label>
                                        <Input
                                            id="sp-city"
                                            placeholder="Athens"
                                            value={form.city}
                                            onChange={(e) => set("city", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="sp-country">Country</Label>
                                        <Input
                                            id="sp-country"
                                            placeholder="Greece"
                                            value={form.country}
                                            onChange={(e) => set("country", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Branding
                                </h3>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="sp-logo">Logo URL</Label>
                                    <Input
                                        id="sp-logo"
                                        placeholder="https://acme.com/logo.png"
                                        value={form.logo_url}
                                        onChange={(e) => {
                                            set("logo_url", e.target.value);
                                            setLogoBroken(false);
                                        }}
                                    />
                                    {logoUrl && !logoBroken && (
                                        <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary/40 px-2.5 py-1.5 w-fit">
                                            <img
                                                src={logoUrl}
                                                alt="Logo preview"
                                                className="h-8 w-8 object-contain rounded"
                                                onError={() => setLogoBroken(true)}
                                            />
                                            <span className="text-xs text-muted">Preview</span>
                                        </div>
                                    )}
                                    {logoUrl && logoBroken && (
                                        <p className="text-xs text-danger">
                                            Could not load image from that URL.
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">SMS</h3>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="sp-sender-id">SMS sender ID</Label>
                                    <Input
                                        id="sp-sender-id"
                                        placeholder="AcmeMktg"
                                        maxLength={11}
                                        value={form.sender_id}
                                        onChange={(e) =>
                                            set("sender_id", e.target.value)
                                        }
                                    />
                                    <p className="text-xs text-muted">
                                        Alphanumeric, up to 11 characters.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Business description
                                </h3>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="sp-business-description">
                                        What the company offers
                                    </Label>
                                    <TextArea
                                        id="sp-business-description"
                                        rows={6}
                                        placeholder="e.g. We help SaaS founders book 5–10 qualified discovery calls per week through outbound + paid LinkedIn. Typical clients are seed-Series B B2B startups in the US/EU."
                                        value={form.business_description}
                                        onChange={(e) =>
                                            set("business_description", e.target.value)
                                        }
                                        maxLength={5000}
                                    />
                                    <p className="text-xs text-muted">
                                        Used by the AI as context when generating email and SMS
                                        outreach so messages reflect what you actually offer.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Signature
                                </h3>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="sp-signature">
                                        Custom email signature
                                    </Label>
                                    <TextArea
                                        id="sp-signature"
                                        rows={6}
                                        placeholder="Optional free-text override for email footer…"
                                        value={form.signature}
                                        onChange={(e) =>
                                            set("signature", e.target.value)
                                        }
                                    />
                                    <p className="text-xs text-muted">
                                        Leave blank to let the AI compose a footer from the
                                        fields above.
                                    </p>
                                </div>
                            </section>

                            {error && (
                                <div>
                                    <FieldError>{error}</FieldError>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button slot="close" variant="secondary" type="button">
                                Cancel
                            </Button>
                            <ActionButtonWithPending
                                type="submit"
                                isDisabled={isPending}
                                isPending={isPending}
                                idleLeading={<Save className="size-4" />}
                            >
                                {isEdit ? "Save changes" : "Create profile"}
                            </ActionButtonWithPending>
                        </Modal.Footer>
                    </form>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
