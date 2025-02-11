const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()
const port = process.env.PORT || 9000
const app = express()
// const jwt = require('jsonwebtoken') 

// Middle were
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
    
}
app.use(cors(corsOptions))
app.use(express.json())

// Uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lt2wcqp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const jobsCollection = client.db('tomomoni').collection('Jobs')
        const bidsCollection = client.db('tomomoni').collection('bids')

        // jwt generator
        // app.post('/jwt' , async (req, res) => {
        //     const email = req.body;
        //     const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        //         expiresIn: '1d'
        //     })
        //     res.send({token})
        // })

        // Get all jobs data from db
        app.get('/jobs', async (req, res) => {
            const result = await jobsCollection.find().toArray();
            res.send(result);
        });

        // Only my applied job data using category
        app.get('/bids', async (req, res) => {
            const filter = req.query.category;
            let query = {};
            if (filter) query = { category: filter };
            const result = await bidsCollection.find(query);
            res.send(result);
        })

        // Get single jobs data from db
        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.findOne(query);
            res.send(result);
        })

        // get title based  data 
        app.get('/jobs-title/:title', async (req, res) => {
            const title = req.params.title;
            const query = { title }
            const result = await jobsCollection.find(query).toArray();
            res.send(result)
        })

        // Delete single jobs data from db
        app.delete('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.deleteOne(query)
            res.send(result);
        })

        // Update single jobs data
        app.put('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const updateJobData = req.body;
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    ...updateJobData
                }
            }
            const result = await jobsCollection.updateOne(query, updateDoc, options)
            res.send(result);
        })

        // Save bids data to database collection
        app.post('/bid', async (req, res) => {
            const bidData = req.body;
            const result = await bidsCollection.insertOne(bidData);
            res.send(result)
        })

        // Save job data to database collection
        app.post('/job', async (req, res) => {
            const jobData = req.body;
            const result = await jobsCollection.insertOne(jobData);
            res.send(result)
        })

        // Only my posted job data using email
        app.get('/:email', async (req, res) => {  
            const email = req.params.email
            const query = { "buyer.email": email }
            const result = await jobsCollection.find(query).toArray();
            res.send(result) 
        })

        // Only my applied job data using email
        app.get('/my-email/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const result = await bidsCollection.find(query).toArray();
            res.send(result)
        })

        // Find bid request data using buyer email
        app.get('/bid-request/:email', async (req, res) => {
            const email = req.params.email
            const query = { buyerEmail: email }
            const result = await bidsCollection.find(query).toArray();
            res.send(result)
        })

        // Update total bid number
        app.patch('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const { totalBid } = req.body;
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: { job_applicant_number: totalBid }
            }
            const result = await jobsCollection.updateOne(query, updateDoc)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 })
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hi tomomoni users');
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})