const express = require('express');
const cors = require('cors');

// const jwt = require('jsonwebtoken');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');

// require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// app.use(cors());
const corsConfig = {
    origin: 'https://mosque-management.web.app',
}
app.use(cors(corsConfig))

app.use(express.json());

const SSLCommerzPayment = require("sslcommerz-lts");
// sslcommarz
const store_id = process.env.STORE_ID
const store_passwd = process.env.STORE_PASS

const is_live = false; //true for live, false for sandbox

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8bklk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// const uri = 'mongodb+srv://mosque:5QIvxbZwzSx8kWGY@cluster0.8bklk.mongodb.net/?retryWrites=true&w=majority';
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




// const uri = "mongodb+srv://mosque:<password>@cluster0.8bklk.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ruqflxh.mongodb.net/?retryWrites=true&w=majority`;

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send({ message: 'UnAuthorized access' });
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'Forbidden access' })
//         }
//         req.decoded = decoded;
//         next();
//     });
// }







async function run() {
    try {
        await client.connect();

        const helpCollection = client.db('allCampaign').collection('campaign');
        const eventCollection = client.db('allCampaign').collection('events');
        const grantInfoCollection = client.db('allCampaign').collection('grantInfo');
        const expertsCollection = client.db('allCampaign').collection('experts');
        const userCollection = client.db('allCampaign').collection('users');
        const imamCollection = client.db('allCampaign').collection('imam');
        const KhutbaCollection = client.db('allCampaign').collection('Khutba');
        const jammatCollection = client.db('allCampaign').collection('jamaat');




        // const verifyAdmin = async (req, res, next) => {
        //     const requester = req.decoded.email;
        //     const requesterAccount = await userCollection.findOne({
        //         email: requester,
        //     });
        //     if (requesterAccount.role === "admin") {
        //         next();
        //     } else {
        //         res.status(403).send({ message: "forbidden" });
        //     }
        // };




        // app.post('/jwt', (req, res) => {
        //     const user = req.body;
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '8h' })
        //     res.send({ token })
        // })





        // add jamaat
        app.post("/jamaattime", async (req, res) => {
            const jamaat = req.body;
            const result = await jammatCollection.insertOne(jamaat);
            res.send(result);
        });



        app.get('/jamaattime', async (req, res) => {
            const query = {};
            const alljamaat = await jammatCollection.find(query).toArray();
            res.send(alljamaat);
        });



        app.get('/jamaattime/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) };
            const result = await jammatCollection.findOne(query);
            res.send(result)
        })



        //update
        app.put("/jamaattime/:id", async (req, res) => {
            const id = req.params.id;
            const jamaat = req.body;

            const result = await jammatCollection.updateOne(
                { _id: ObjectId(id) }, // Find Data by query many time query type is "_id: id" Cheack on database
                {
                    $set: jamaat, // Set updated Data
                },
                { upsert: true } // define work
            );
            res.send({ result });
        });





        app.post("/allKhutba", async (req, res) => {
            const postKhutba = req.body;
            const result = await KhutbaCollection.insertOne(postKhutba);
            res.send(result);
        });

        //get khutba
        app.get('/allKhutba', async (req, res) => {
            const query = {};
            const allKhutba = await KhutbaCollection.find(query).toArray();
            res.send(allKhutba);
        });

        //delete khutba
        app.delete('/allKhutba/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {
                _id: ObjectId(id)
            };
            const result = await KhutbaCollection.deleteOne(filter);
            res.send(result);
        })









        app.post('/imam', async (req, res) => {
            const imam = req.body;
            const result = await imamCollection.insertOne(imam);
            res.send(result);
        });




        app.get('/campaigns', async (req, res) => {
            console.log('query', req.query);
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};
            const cursor = helpCollection.find(query);
            let campaignes;
            if (page || size) {
                // 0 --> skip: 0 get: 0-10(10): 
                // 1 --> skip: 1*10 get: 11-20(10):
                // 2 --> skip: 2*10 get: 21-30 (10):
                // 3 --> skip: 3*10 get: 21-30 (10):
                campaignes = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                campaignes = await cursor.toArray();
            }

            res.send(campaignes);
        });



        app.get('/campaignCount', async (req, res) => {

            const count = await helpCollection.estimatedDocumentCount();
            res.send({ count });
        });




        app.get('/campaign/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) };
            const result = await helpCollection.findOne(query);
            res.send(result)
        })






        //add campaign
        app.post('/campaigns', async (req, res) => {
            const newcampaign = req.body;
            const result = await helpCollection.insertOne(newcampaign);
            res.send(result);
        });





        //delete
        app.delete('/campaign/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const campaign = await helpCollection.deleteOne(query);
            res.send(campaign);
        });


        //update
        app.put("/campaign/:id", async (req, res) => {
            const id = req.params.id;
            const campaign = req.body;

            const result = await helpCollection.updateOne(
                { _id: ObjectId(id) }, // Find Data by query many time query type is "_id: id" Cheack on database
                {
                    $set: campaign, // Set updated Data
                },
                { upsert: true } // define work
            );
            res.send({ result });
        });






        // load all event from mongodb

        app.get('/events', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};
            const cursor = eventCollection.find(query);

            let events;
            if (page || size) {
                events = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                events = await cursor.toArray();
            }

            res.send(events);
        });




        app.get('/eventCount', async (req, res) => {

            const count = await eventCollection.estimatedDocumentCount();
            res.send({ count });
        });

        app.get('/event/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const event = await eventCollection.findOne(query);
            res.send(event);
        })




        //add event
        app.post('/events', async (req, res) => {
            const newevents = req.body;
            const result = await eventCollection.insertOne(newevents);
            res.send(result);
        });



        //delete event
        app.delete('/event/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const event = await eventCollection.deleteOne(query);
            res.send(event);
        });



        //update event
        //update
        app.put("/event/:id", async (req, res) => {
            const id = req.params.id;
            const event = req.body;

            const result = await eventCollection.updateOne(
                { _id: ObjectId(id) }, // Find Data by query many time query type is "_id: id" Cheack on database
                {
                    $set: event, // Set updated Data
                },
                { upsert: true } // define work
            );
            res.send({ result });
        });





        // load all experts from mongodb

        app.get('/experts', async (req, res) => {
            const query = {};
            const cursor = expertsCollection.find(query);
            const experts = await cursor.toArray();
            res.send(experts);
        });

        //get experts by role


        app.get('/experts/:role', async (req, res) => {
            const role = req.params.role;
            const query = { role: role }
            const user = await expertsCollection.find(query).toArray();

            res.send(user);
        })

        //post experts
        app.post("/experts", async (req, res) => {
            const expertAdd = req.body;
            const result = await expertsCollection.insertOne(expertAdd);
            res.send(result);
        });

        //delete experts
        app.delete('/experts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {
                _id: ObjectId(id)
            };
            const result = await expertsCollection.deleteOne(filter);
            res.send(result);
        })


        //get experts by id

        app.get('/expertSingle/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) };
            const result = await expertsCollection.findOne(query);
            res.send(result)
        })
        //update
        app.put('/experts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const expert = req.body;
            const option = { upsert: true };
            const updatedExpert = {
                $set: {
                    name: expert.name,

                    facebook: expert.facebook,
                    twitter: expert.twitter,
                    instagram: expert.instagram,
                    google: expert.google,
                    img: expert.img,
                    short_description: expert.short_description,
                    role: expert.role,
                    phone: expert.phone
                }

            }
            const result = await expertsCollection.updateOne(filter, updatedExpert, option);
            res.send(result);
        })











        //khutba add

        app.post("/addKhutba", async (req, res) => {
            const postKhutba = req.body;
            const result = await KhutbaCollection.insertOne(postKhutba);
            res.send(result);
        });

        //get khutba
        app.get('/allKhutba', async (req, res) => {
            const query = {};
            const allKhutba = await KhutbaCollection.find(query).toArray();
            res.send(allKhutba);
        });








        // **************User**************

        app.get('/user', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);


        });


        app.get('/puser/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const users = await userCollection.findOne(query);
            res.send(users);


        });






        //user info save to database 
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            // console.log(user)
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            // const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '8h' })
            // res.send({ result, token });
            res.send(result);


        })








        //delete event
        app.delete('/user/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(id)
            const filter = { email: email };
            // const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(filter);
            // const event = await eventCollection.deleteOne(query);
            res.send(result);
        });



        //update
        app.put('/puser/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const expert = req.body;
            const option = { upsert: true };
            const updatedExpert = {
                $set: {
                    phone: expert.phone,
                    about: expert.about,
                    birth: expert.birth,
                    link: expert.link,
                    profilelink: expert.profilelink,
                    gender: expert.gender,
                    street: expert.street,
                    city: expert.city,
                    state: expert.state,
                    zip: expert.zip,


                }

            }
            const result = await userCollection.updateOne(filter, updatedExpert, option);
            res.send(result);
        })








        // an admin can only make admin

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

        // make a admin and verify

        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'forbidden' });
            }

        })

        //delete event
        app.delete('/event/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const event = await eventCollection.deleteOne(query);
            res.send(event);
        });


        ///donate

        app.post('/grant-info', async (req, res) => {
            const data = req.body;
            const result = await grantInfoCollection.insertOne(data);
            res.send(result);
        });

        app.get('/grant-info', async (req, res) => {
            const result = await grantInfoCollection.find().toArray();
            res.send(result)
        });

        app.get('/grant-info/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await grantInfoCollection.findOne(filter);
            res.send(result)
        });

        app.post('/create-payment-intent', async (req, res) => {
            // const { price } = req.body; // or 
            const data = req.body;
            const amount = data.amount;
            const price = amount * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: price, // dollar needs to be converted to cents
                currency: 'usd',
                "payment_method_types": [
                    "card"
                ],
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            })
        })





        //ssl comnmerce 
        app.post("/checkout", async (req, res) => {
            const order = req.body;
            const { amount, telEmail, name, address, campaignname } = order;

            if (!amount || !telEmail || !name || !address || !campaignname) {
                return res.send({ error: "please provide all the information" })
            }


            const transactionId = new ObjectId().toString();

            const data = {
                total_amount: order.amount,
                currency: order.currency,
                tran_id: transactionId, // use unique tran_id for each api call
                success_url: `https://mosque-management.onrender.com/donation/success?transactionId=${transactionId}`,
                fail_url: `https://mosque-management.onrender.com/donation/fail?transactionId=${transactionId}`,
                cancel_url: "https://mosque-management.onrender.com/donation/cancel",
                ipn_url: "http://localhost:3030/ipn",
                shipping_method: "Courier",
                product_name: order.campaignname,
                product_category: "Electronic",
                product_profile: "general",
                cus_name: order.name,
                cus_email: order.telEmail,
                cus_add1: order.address,
                cus_add2: "Dhaka",
                cus_city: "Dhaka",
                cus_state: "Dhaka",
                cus_postcode: "1000",
                cus_country: "Bangladesh",
                cus_phone: "01711111111",
                cus_fax: "01711111111",
                ship_name: "Customer Name",
                ship_add1: "Dhaka",
                ship_add2: "Dhaka",
                ship_city: "Dhaka",
                ship_state: "Dhaka",
                ship_postcode: "1230",
                ship_country: "Bangladesh",
            };


            const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
            sslcz.init(data).then((apiResponse) => {
                // Redirect the user to payment gateway
                let GatewayPageURL = apiResponse.GatewayPageURL;
                console.log(apiResponse);
                grantInfoCollection.insertOne({
                    ...order,
                    // amount: grantInfoCollection.amount,
                    transactionId,
                    paid: false,
                });
                res.send({ url: GatewayPageURL });
            });
        });


        //donation post
        app.post("/donation/success", async (req, res) => {
            const { transactionId } = req.query;
            if (!transactionId) {
                return res.redirect("https://mosque-management.web.app/donation/fail");
            }
            const result = await grantInfoCollection.updateOne(
                { transactionId },
                { $set: { paid: true, paidAt: new Date() } }
            );

            if (result.modifiedCount > 0) {
                res.redirect(
                    `https://mosque-management.web.app/donation/success?transactionId=${transactionId}`
                );
            }
        });

        //faield donation
        app.post("/donation/fail", async (req, res) => {
            const { transactionId } = req.query;
            if (!transactionId) {
                return res.redirect("https://mosque-management.web.app/donation/fail");
            }
            const result = await grantInfoCollection.deleteOne({ transactionId });

            if (result.deletedCount) {
                res.redirect(
                    "https://mosque-management.web.app/donation/fail"
                );
            }

        })



        // donation info get

        app.get("/donation-info/by-transaction-id/:id", async (req, res) => {
            const { id } = req.params;
            const donation = await grantInfoCollection.findOne({ transactionId: id });
            res.send(donation);
        })


        app.get('/checkout/:telEmail/:paid', async (req, res) => {
            const telEmail = req.params.telEmail;
            const query = {
                telEmail: telEmail,
                paid: true

            };
            const allbuyer = await grantInfoCollection.find(query).toArray();
            res.send(allbuyer);
        });



        //get all user donation for admin routes
        app.get('/checkout/:paid', async (req, res) => {
            const paid = req.params.paid;
            const query = {
                paid: true

            };
            const allbuyer = await grantInfoCollection.find(query).toArray();
            res.send(allbuyer);
        });




    }
    finally {

    }
}

run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Running Masque Management Server');
});

app.get('/test', (req, res) => {
    res.send('running test server');
});


app.listen(port, () => {
    console.log('listining to port', port);
})
