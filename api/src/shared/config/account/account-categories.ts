export const ACCOUNT_CATEGORIES = [
    { label: "Dentist", value: "dentist", businessType: "Dentist" },
    { label: "Doctor", value: "doctor", businessType: "MedicalBusiness" },
    { label: "Physical Therapist", value: "physical_therapist", businessType: "Physiotherapy" },
    { label: "Psychologist", value: "psychologist", businessType: "Psychologist" },
    { label: "Psychiatrist", value: "psychiatrist", businessType: "MedicalBusiness" },
    { label: "Dermatologist", value: "dermatologist", businessType: "Dermatologist" },
    { label: "Cardiologist", value: "cardiologist", businessType: "MedicalBusiness" },
    { label: "Orthopedist", value: "orthopedist", businessType: "MedicalBusiness" },
    { label: "Pediatrician", value: "pediatrician", businessType: "Pediatrician" },
    { label: "Gynecologist", value: "gynecologist", businessType: "MedicalBusiness" },
    { label: "Ophthalmologist", value: "ophthalmologist", businessType: "Optometrist" },
    { label: "Neurologist", value: "neurologist", businessType: "MedicalBusiness" },
    { label: "Oncologist", value: "oncologist", businessType: "MedicalBusiness" },
    { label: "Radiologist", value: "radiologist", businessType: "MedicalBusiness" },
    { label: "Anesthesiologist", value: "anesthesiologist", businessType: "MedicalBusiness" },
    { label: "Surgeon", value: "surgeon", businessType: "MedicalBusiness" },
    { label: "Nurse", value: "nurse", businessType: "MedicalBusiness" },
    { label: "Pharmacist", value: "pharmacist", businessType: "Pharmacy" },
    { label: "Nutritionist", value: "nutritionist", businessType: "MedicalBusiness" },
    { label: "Chiropractor", value: "chiropractor", businessType: "Chiropractor" },
    { label: "Massage Therapist", value: "massage_therapist", businessType: "HealthAndBeautyBusiness" },
    { label: "Acupuncturist", value: "acupuncturist", businessType: "MedicalBusiness" },
    { label: "Other", value: "other", businessType: "LocalBusiness" },
];


export const getBusinessType = (category: string): string => {
    return (
        ACCOUNT_CATEGORIES.find((option) => option.value === category)?.businessType ||
        "LocalBusiness"
    );
};