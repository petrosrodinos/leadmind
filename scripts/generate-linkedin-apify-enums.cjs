const fs = require("fs");
const path = require("path");

const docPath = path.join(
    __dirname,
    "../api/integrations-documentation/linkedin-leads.json",
);
const doc = JSON.parse(fs.readFileSync(docPath, "utf8"));
const props = doc.components.schemas.inputSchema.properties;

function pair(propName) {
    const items = props[propName].items;
    const values = items.enum;
    const labels = items.enumTitles || items.enum;
    const labelRecord = {};
    for (let i = 0; i < values.length; i += 1) {
        labelRecord[values[i]] = labels[i];
    }
    return { values, labelRecord };
}

const seniority = pair("contactSeniority");
const departments = pair("departments");
const contactLoc = pair("contactLocation");
const companySize = pair("companySize");
const companyRevenue = pair("companyRevenue");
const companyIndustries = pair("companyIndustries");

const chunks = [];
chunks.push(
    `export const LINKEDIN_APIFY_CONTACT_SENIORITY = ${JSON.stringify(seniority.values)} as const;`,
);
chunks.push(
    `export const LINKEDIN_APIFY_CONTACT_SENIORITY_LABELS = ${JSON.stringify(seniority.labelRecord)} as Record<string, string>;`,
);
chunks.push(
    `export const LINKEDIN_APIFY_DEPARTMENTS = ${JSON.stringify(departments.values)} as const;`,
);
chunks.push(
    `export const LINKEDIN_APIFY_CONTACT_LOCATIONS = ${JSON.stringify(contactLoc.values)} as const;`,
);
chunks.push(
    `export const LINKEDIN_APIFY_COMPANY_SIZES = ${JSON.stringify(companySize.values)} as const;`,
);
chunks.push(
    `export const LINKEDIN_APIFY_COMPANY_REVENUES = ${JSON.stringify(companyRevenue.values)} as const;`,
);
chunks.push(
    `export const LINKEDIN_APIFY_COMPANY_INDUSTRIES = ${JSON.stringify(companyIndustries.values)} as const;`,
);

const outPath = path.join(
    __dirname,
    "../app/src/features/filters/constants/linkedin-apify-enums.generated.ts",
);
fs.writeFileSync(outPath, `${chunks.join("\n")}\n`);
console.log("Wrote", outPath);
