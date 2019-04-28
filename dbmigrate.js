var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost/";

let users = [
    {
        name: 'Alice Alison',
        username: 'alice',
        password: 'passw0rd',
    },
    {
        name: 'Bobby Bobson',
        username: 'bobby',
        password: 'secret',
    }
]

let invoices = {
    'alice': [
        {
            date: new Date('December 17, 2018'),
            number: 'A-0001',
            amount: 1200
        },
        {
            date: new Date('January 1, 2019'),
            number: 'A-0003',
            amount: 4500
        },
        {
            date: new Date('January 23, 2019'),
            number: 'A-0007',
            amount: 3000
        }
    ],
    'bobby': [
        {
            date: new Date('December 20, 2018'),
            number: 'A-0002',
            amount: 3000
        },
        {
            date: new Date('January 2, 2019'),
            number: 'A-0004',
            amount: 4500
        },
        {
            date: new Date('January 5, 2019'),
            number: 'A-0005',
            amount: 3000
        },
        {
            date: new Date('January 20, 2019'),
            number: 'A-0006',
            amount: 3000
        }
    ]
}

MongoClient.connect(url, {useNewUrlParser:true }, (err, db) => {
    let dbo = db.db("dvna");
    dbo.collections((err, data) => {
        let drops = [];
        data.forEach(col => {
            drops.push(dbo.collection(col.s.name).drop());
        })
        let invoicesColl;
        Promise.all(drops)
            .then(() => {
                let usersColl = dbo.collection("users");

                invoicesColl = dbo.collection("invoices");
                return new Promise((res, rej) => {
                    usersColl.insertMany(users, (err, insertedDocuments) => {
                        if (err) rej(err);
                        res(insertedDocuments)
                    });
                })
            })
            .then((insertedDocuments) => {
                let newInvoices = [];
                insertedDocuments.ops.forEach(doc => {
                    let invoice = invoices[doc.username];

                    if (invoice) {
                        invoice.forEach(inv => {
                            inv.userId = doc._id;
                            inv.payee = doc.name;
                            newInvoices.push(new Promise((res, rej) => {
                                invoicesColl.insertOne(inv, (err, createdInvoice) => {
                                    if (err) rej(err)
                                    res(createdInvoice);
                                });
                            }));
                        })
                    }
                    return Promise.all(newInvoices);
                })
            })
            .then(() => {
                console.log("Database has been reset.")
                db.close();
            })
            .catch((err) => {
                console.log(err.message, err.stack);
            })
    });
});
