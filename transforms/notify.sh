#!/bin/bash

for file in $(find /pfs/filings/ -name "*.fec.gz");
do
	echo "getting summary"
	SUMMARY=$(gunzip < $file | head -n 10 | ./bin/fec convert | sed -n 2p)
	ID=$(echo $file | tr -dc '0-9')

	echo "testing form"
	if echo $SUMMARY | jq -e 'has("committee_name") and has("form_type") and has("filer_committee_id_number") and .form_type != "F24A" and .form_type != "F24N"' > /dev/null; then
		echo "forming message"
		PAYLOAD=$(echo $SUMMARY | jq --compact-output --arg filing_id $ID '{$filing_id,form_type,committee_name,organization_name,filer_committee_id_number,coverage_from_date,coverage_through_date,col_a_total_receipts,col_a_total_disbursements,col_a_cash_on_hand_close_of_period}')
		PAYLOAD=${PAYLOAD//\'/\'\'}
		echo "notifying"
		psql -c "NOTIFY fecImportStart, '$PAYLOAD';"
	fi
done
