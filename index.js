const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();


app.use(cors());
app.use(express.json());



const uri = "mongodb+srv://mosque:7BSq1R4J2tdYLdOx@cluster0.8bklk.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();

        const helpCollection = client.db('allCampaign').collection('campaign');
        const eventCollection = client.db('allCampaign').collection('events');
        const expertsCollection = client.db('allCampaign').collection('experts');



        // load all campaigns from mongodb

        app.get('/allcampaign', async (req, res) => {
            const query = {};
            const cursor = helpCollection.find(query);
            const campaignes = await cursor.toArray();
            res.send(campaignes);
        });

        app.put('/campaign/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: data
            };
            const options = { upsert: true };
            const result = await helpCollection.updateOne(filter, updateDoc, options);
            req.send(result);
        })


        app.get('/campaign/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const campaign = await helpCollection.findOne(query);
            res.send(campaign);
        })






        //add campaign
        app.post('/allcampaign', async (req, res) => {
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


        // load all event from mongodb

        app.get('/events', async (req, res) => {
            const query = {};
            const cursor = eventCollection.find(query);
            const events = await cursor.toArray();
            res.send(events);
        });


        // load all experts from mongodb

        app.get('/experts', async (req, res) => {
            const query = {};
            const cursor = expertsCollection.find(query);
            const experts = await cursor.toArray();
            res.send(experts);
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
