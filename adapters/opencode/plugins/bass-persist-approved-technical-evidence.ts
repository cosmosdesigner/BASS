import persistence = require("./bass-persist-approved-technical-evidence.js")
type TechnicalEvidence = { category?: string, retrievedDate?: string }
export const issueTechnicalEvidencePreview = persistence.issueTechnicalEvidencePreview as (input: { projectName: string, target: string, markdown: string, evidence: TechnicalEvidence[], extractedAt?: string, approvedAt?: string, clock?: () => string }) => { previewId: string, integrityHash: string, recordId: string, extractedAt: string, approvedAt: string }
// Runtime implementation enforces the D10 category-to-D3-source-type mapping.
export const persistApprovedTechnicalEvidence = persistence.persistApprovedTechnicalEvidence as (input: { approvedAt?: string } & object) => any
export const BassPersistApprovedTechnicalEvidencePlugin: unknown = persistence.BassPersistApprovedTechnicalEvidencePlugin
