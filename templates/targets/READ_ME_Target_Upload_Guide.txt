OTHOBA TARGET UPLOAD TEMPLATES

Eight blank CSV templates are included: KAM, Seller, Category and Vertical, each Daily and Monthly.
Open the matching template in Excel, enter plans, and save as CSV UTF-8. Do not change column headings.

Dashboard workflow
1. Open Data & daily uploads and select Planning targets.
2. Select Export matching names on the relevant card to obtain names from your loaded sales history.
3. Fill a matching target template with those exact names.
4. Upload CSV under the matching level and Daily or Monthly option.
5. Review new rows, replacements and duplicates, then Save target records.
6. Open Targets & achievement. Set dates, level, plan frequency and metric.
7. Export full HTML after saving to share sales history AND targets.

Column rules
Date: YYYY-MM-DD, for example 2026-10-25.
Month: YYYY-MM, for example 2026-10.
KAM: exact Sales Person from the sales dump.
Seller: exact Vendor / shop account name.
Category: exact category name. CategoryLevel must be 1, 2, 3, 4 or 5.
Vertical: exact Business Unit from the sales dump. This initial mapping is stated in the dashboard.
GMVTarget and NMVTarget: non-negative amounts in BDT, without currency symbols. Decimals allowed.
GOSTarget and NOSTarget: non-negative whole suborder counts.
At least one of the four metrics is required per row. Leave unused metrics blank. A blank is unknown; a numeric zero is an explicit zero target. No achievement percentage is calculated for a zero target.

Examples (illustrative names and plans; not real targets)
KAM daily:
Date,KAM,GMVTarget,GOSTarget,NMVTarget,NOSTarget
2026-10-25,Replace with exact KAM name,100000,50,80000,40

Category monthly:
Month,Category,CategoryLevel,GMVTarget,GOSTarget,NMVTarget,NOSTarget
2026-10,Replace with exact category name,1,3000000,1500,2400000,1200

Duplicate and correction policy
A target key consists of level, Daily/Monthly frequency, date/month, category level where relevant, and exact entity name. Identical rows are skipped even across renamed files. Different values on an existing key replace the full metric set after preview. Blank cells clear previous metric targets on replacement. Unmentioned keys remain saved. Conflicting values for the same key inside selected files block saving until corrected. Invalid files are listed separately; valid files remain reviewable. Targets never change sales records.

Scorecard calculations
Daily plans: sum targets for every selected day; actuals cover exactly that range.
Monthly plans: sum full-month plans for months in the selected range; actuals start on the first day of the selected start month and end on the selected cutoff date. No automatic target proration. Daily and monthly plans are independent; they are never added together.
Achievement = loaded actual / target. It is available only when all relevant target periods and all required sales report dates are loaded and target > 0. Missing dates remain unknown. The report lists unmatched target names as No activity / unmatched so spelling and mapping can be checked.
GMV/GOS use gross sales; NMV/NOS use delivered sales. GOS and NOS are distinct SubOrderId counts recalculated within the entity and date range, not item quantities.
Target reports use the date range and their own level/frequency/metric/search controls; global sales dimension filters do not apply. This avoids comparing a sliced portfolio to an unsliced target.

Color rules
Positive growth: + in dark green. Negative growth: minus sign in dark red. Zero growth is neutral.
Achievement: below 80% dark red; 80% through 90% inclusive yellow; above 90% but below 100% blue; 100% or more dark green. Unavailable percentages are neutral.

Storage and sharing
This HTML edition saves sales history and targets in the current browser. Full HTML export and JSON backup include both. It does not synchronize changes to the separate server package or to HTML files already shared.
Before switching from an older copy, export its Data backup. Restore that backup in this updated dashboard if your history is not already present, then upload targets. Export the updated full HTML after your daily work.
