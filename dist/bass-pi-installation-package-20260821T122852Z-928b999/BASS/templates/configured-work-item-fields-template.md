# Configured Work Item Fields

Record only verified Azure DevOps Work Item field mappings. Unknown, unmapped, or unverified fields are unavailable and must never be guessed or written.

## Standard Fields

| Local field name | ADO field reference | Supported Work Item types | Verification status |
| --- | --- | --- | --- |
| title | <ado_reference_name> | <Epic_Feature_User_Story_Bug_Task> | <verified_or_unavailable> |
| description | <ado_reference_name> | <Epic_Feature_User_Story_Bug_Task> | <verified_or_unavailable> |
| acceptance_criteria | <ado_reference_name> | <Feature_User_Story_Bug_Task> | <verified_or_unavailable> |
| priority | <ado_reference_name> | <Epic_Feature_User_Story_Bug_Task> | <verified_or_unavailable> |
| effort | <ado_reference_name> | <Feature_User_Story_Bug_Task> | <verified_or_unavailable> |
| assignee | <ado_reference_name> | <Epic_Feature_User_Story_Bug_Task> | <verified_or_unavailable> |
| area | <ado_reference_name> | <Epic_Feature_User_Story_Bug_Task> | <verified_or_unavailable> |
| iteration | <ado_reference_name> | <Epic_Feature_User_Story_Bug_Task> | <verified_or_unavailable> |

## Organization-Specific Custom Fields

| Local field name | ADO field reference | Supported Work Item types | Verification status |
| --- | --- | --- | --- |
| <local_custom_field_name> | <ado_reference_name> | <supported_types> | <verified_or_unavailable> |

## Mapping Rules

Use a field only when its row identifies a verified ADO field reference and includes the target Work Item type. `unavailable`, missing, or unknown mappings must not be included in a plan token, preview, import, or write. Verification status is specific to the target host and organization; it does not imply that similarly named fields are available elsewhere.
