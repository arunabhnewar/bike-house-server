const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
// const admin = require("firebase-admin");
require('dotenv').config();

// port
const port = process.env.PORT || 5000;

// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qi34s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// async function verifyToken(req, res, next) {
//     if (req?.headers?.authorization?.startsWith(`Bearer `)) {
//         const token = req.headers.authorization.split(' ')[1];

//         try {
//             const decodedUser = await admin.auth().verifyIdToken(token);
//             req.decodedEmail = decodedUser.email;

//         } catch {

//         }
//     }
//     next();
// }


async function run() {
    try {
        await client.connect();
        const database = client.db('bike-house-database');
        const productCollection = database.collection('products');
        const purchaseCollection = database.collection('purchases');
        const userCollection = database.collection('users');

        // GET API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        // Add NEW Products API
        app.post('/products', async (req, res) => {
            console.log(req.body);
            const result = await productCollection.insertOne(req.body);
            res.send(result);
        })

        // Add Purchase API
        app.post('/purchases', async (req, res) => {
            const purchase = req.body;
            const result = await purchaseCollection.insertOne(purchase);
            res.send(result);
        })
        // GET Purchase API
        app.get('/purchases', async (req, res) => {
            const cursor = purchaseCollection.find({});
            const purchase = await cursor.toArray();
            console.log(purchase);
            res.send(purchase);
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // Add Users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result)
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // GET EMAIL API
        app.get('/purchase/:email', async (req, res) => {
            const email = req.params.email;
            const result = await purchaseCollection.find({ email }).toArray();
            res.json(result);
        })

        app.put('users/admin', async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await userCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await userCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            } else {
                res.status(403).json({ message: 'you do not have access to make admin' })
            }
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Bike House Portal!!')
})

app.listen(port, () => {
    console.log(`Running at ${port}`)
})