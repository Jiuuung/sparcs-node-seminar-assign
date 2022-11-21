const express = require('express');
const FeedModel = require('../models/feed');

const router = express.Router();

class FeedDB {
    static _inst_;
    static getInst = () => {
        if ( !FeedDB._inst_ ) FeedDB._inst_ = new FeedDB();
        return FeedDB._inst_;
    }


    constructor() { console.log("[Feed-DB] DB Init Completed"); }

    selectItems = async( count ) => {
        try{
            if(count === 0) return { success: true, data: [] };
            const DBItemCount = await FeedModel.countDocuments();
            if (count > DBItemCount) return {success:false, data:"Too many items queried"};
            if(count<0) return {success: false, data:"Invalid count provided"};
            const res = await FeedModel.find().sort({'createdAt':-1}).limit(count).exec();
            return {success: true, data: res};
        } catch (e) {
            console.log(`[Feed-DB] Select Error: ${ e }`);
            return { success: false, data: `DB Error - ${ e }`};
        }
    }

    insertItem = async( item ) => {
        const { title, content } = item;
        try {
            const newItem = new FeedModel({title, content});
            const res = await newItem.save();
            return true;
        }
        catch (e) {
            console.log(`[Feed-DB] Insert Error: ${ e }`);
            return false;
        }
    }

    deleteItem = async ( id ) => {
        try {
            const ODeleteFilter = { _id: id };
            const res = await FeedModel.deleteOne(ODeleteFilter);
            return true;
        } catch (e) {
            console.log(`[Feed-DB] Delete Error: ${ e }`);
            return false;
        }
    }

    chooseItem = async (id) => {
        try{
            const res= await FeedModel.find({_id:id});
            return {success: true, data: res};
        } catch (e){
            console.log(`[Feed-DB] Edit Feed Error: ${ e }`);
            return {success: false, data: `DB Error - ${ e }`};
        }
    }

    updateItem = async ( item ) => {
        const {id, content, title }=item;
        try{
            const OUpdateFilter = {_id:id};
            const UpdateValue= { $set: {title: title, content: content}};
            const res = await FeedModel.updateOne(OUpdateFilter, UpdateValue);
            return true;
        }
        catch (e){
            console.log(`[Feed-DB] Update Error: ${ e }`);
            return false;
        }
    }
}

const feedDBInst = FeedDB.getInst();

router.get('/getFeed', async (req, res) => {
    try {
        const requestCount = parseInt(req.query.count);
        const dbRes = await feedDBInst.selectItems(requestCount);
        if (dbRes.success) return res.status(200).json(dbRes.data);
        else return res.status(500).json({ error: dbRes.data })
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.post('/addFeed', async (req, res) => {
   try {
       const { title, content } = req.body;
       const addResult = await feedDBInst.insertItem({ title, content });
       if (!addResult) return res.status(500).json({ error: dbRes.data })
       else return res.status(200).json({ isOK: true });
   } catch (e) {
       return res.status(500).json({ error: e });
   }
});

router.post('/deleteFeed', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);
        const deleteResult = await feedDBInst.deleteItem(id);
        if (!deleteResult) return res.status(500).json({ error: "No item deleted" })
        else return res.status(200).json({ isOK: true });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
})

router.post('/editFeed', async (req, res) => {
    try {
        const { id } = req.body;
        const editById=await feedDBInst.chooseItem(id);
        console.log(editById.data);
        if(editById.success) return res.status(200).json(editById.data);
        else return res.status(500).json({ error: editById.data })
    } catch (e) {
        return res.status(500).json({ error: e });
    }
})
router.post('/editFeedSave', async (req, res) => {
    try {
        const { id, title, content } = req.body;
        const editById= await feedDBInst.updateItem({id, title, content});
        if(editById) return res.status(200).json({ isOK: true });
        else return res.status(500).json({ error: "No item edited" })
    } catch (e) {
        return res.status(500).json({ error: e });
    }
})

module.exports = router;