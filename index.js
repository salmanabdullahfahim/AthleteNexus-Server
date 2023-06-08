const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');

require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sjuvyra.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();
        // Send a ping to confirm a successful connection

        const userCollections = await client.db("athleteNexusDB").collection("users");


        app.get('/users', async(req,res)=>{
            const result = await userCollections.find().toArray();
            res.send(result);
        })

        app.post('/users', async(req, res) => {
            const user = req.body;
            const query = { user: user.email };
            const existingUser = await userCollections.findOne(query);
    
            if(existingUser) {
                return res.send({message: "User already exists"})
            }
            const result = await userCollections.insertOne(user);
            res.send(result);
        })

        app.patch('/users/role', async (req, res) => {
            const id = req.query.id;
            const role = req.query.role;
            console.log(id, role);
          
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
              $set: {
                role: `${role}`
              },
            };
          
            const result = await userCollections.updateOne(filter, updateDoc);
            res.send(result);
          });

          app.delete('/users', async (req, res) => {
            const id =  req.query.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollections.deleteOne(query);
            res.send(result);
          })
          
        


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('AthleteNexus is running');
})


app.listen(port, () => {
    console.log(`AthleteNexus is running on port ${port}`)
})