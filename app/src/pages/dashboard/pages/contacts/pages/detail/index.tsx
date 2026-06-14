import { useNavigate, useParams } from "react-router-dom";
import { Routes } from "@/routes/routes";
import { ContactDetailView } from "./components";

export default function ContactDetailPage() {
    const { uuid = "" } = useParams<{ uuid: string }>();
    const navigate = useNavigate();

    return (
        <ContactDetailView
            contactUuid={uuid}
            onBack={() => navigate(-1)}
            onDeleted={() => navigate(Routes.dashboard.contacts)}
        />
    );
}
