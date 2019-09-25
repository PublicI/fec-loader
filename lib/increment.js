const models = require('@publici/fec-model')({
    driver: 'postgres'
});

module.exports = async () => {
    const lookBehind = 1000,
        lookAhead = 10;

    try {
        filings = await models.fec_filing.findAll({
            attributes: ['filing_id'],
            limit: lookBehind,
            where: {
                filing_id: {
                    $lt: 5000000
                }
            },
            order: [['filing_id', 'DESC']]
        });

        models.sequelize.close();

        filings = filings.map(filing => filing.filing_id);

        let tasks = [];

        for (
            let i = filings[0] - lookBehind;
            i <= filings[0] + lookAhead;
            i++
        ) {
            if (!filings.includes(i)) {
                tasks.push(i);
            }
        }

        tasks = tasks.map(
            task => `http://docquery.fec.gov/dcdev/posted/${task}.fec`
        );

        return tasks;
    } catch (err) {
        console.error(err);
    }
}
