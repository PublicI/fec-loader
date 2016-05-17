DROP TABLE IF EXISTS fec_amended_filings;
CREATE VIEW fec_amended_filings
AS
SELECT
  MAX(fec_filings.filing_id) AS filing_id,
  fec_filings.report_id AS report_id,
  MAX(fec_filings.report_number) AS report_number
FROM fec_filings
WHERE (fec_filings.report_id IS NOT NULL)
GROUP BY fec_filings.report_id
UNION
SELECT
  fec_filings.filing_id AS filing_id,
  fec_filings.report_id AS report_id,
  fec_filings.report_number AS report_number
FROM (fec_filings
LEFT JOIN fec_filings fec_filings2
  ON ((fec_filings.filing_id = fec_filings2.report_id)))
WHERE (fec_filings2.report_id IS NULL
AND fec_filings.report_id IS NULL);