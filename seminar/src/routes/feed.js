const express = require('express');

const router = express.Router();

class FeedDB {
    static _inst_;
    static getInst = () => {
        if ( !FeedDB._inst_ ) FeedDB._inst_ = new FeedDB();
        return FeedDB._inst_;
    }

    #id = 1; #itemCount = 1; #LDataDB = [{ id: 0, title: "test1", content: "Example body" }];

    constructor() { console.log("[Feed-DB] DB Init Completed"); }

    selectItems = ( count ) => {
        if (count > this.#itemCount) return { success: false, data: "Too many items queried"  };
        if (count < 0) return { success: false, data: "Invalid count provided" };
        else return { success: true, data: this.#LDataDB.slice(0, count) }
    }

    insertItem = ( item ) => {
        const { title, content } = item;
        this.#LDataDB.push({ id: this.#id, title, content });
        this.#id++; this.#itemCount++;
        return true;
    }

    deleteItem = ( id ) => {
        let BItemDeleted = false;
        this.#LDataDB = this.#LDataDB.filter((value) => {
            const match = (value.id === id);
            if (match) BItemDeleted = true;
            return !match;
        });
        if (BItemDeleted) id--;
        return BItemDeleted;
    }
    chooseItem = (id) => {
        function findid(element){
            if(element.id==id){
                return true;
            }
        }
        const item=this.#LDataDB.find(findid);
        if(item) return { success: true, data: item }
        else return { success: false, data: "Can't find element" }
    }
    updateItem = ( item ) => {
        const { id, title, content } = item;
        const temp=this.#LDataDB.map(e=>{
            if(e.id==parseInt(id)){
                e.title=title;
                e.content=content;
                return e;
            }
            return e;
        });
        this.#LDataDB=temp;
        return true;
    }
}

const feedDBInst = FeedDB.getInst();

router.get('/getFeed', (req, res) => {
    try {
        const requestCount = parseInt(req.query.count);
        const dbRes = feedDBInst.selectItems(requestCount);
        if (dbRes.success) return res.status(200).json(dbRes.data);
        else return res.status(500).json({ error: dbRes.data })
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.post('/addFeed', (req, res) => {
   try {
       const { title, content } = req.body;
       const addResult = feedDBInst.insertItem({ title, content });
       if (!addResult) return res.status(500).json({ error: dbRes.data })
       else return res.status(200).json({ isOK: true });
   } catch (e) {
       return res.status(500).json({ error: e });
   }
});

router.post('/deleteFeed', (req, res) => {
    try {
        const { id } = req.body;
        const deleteResult = feedDBInst.deleteItem(parseInt(id));
        if (!deleteResult) return res.status(500).json({ error: "No item deleted" })
        else return res.status(200).json({ isOK: true });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
})

router.post('/editFeed', (req, res) => {
    try {
        const { id } = req.body;
        const editById=feedDBInst.chooseItem(parseInt(id));
        if(editById.success) return res.status(200).json(editById.data);
        else return res.status(500).json({ error: editById.data })
    } catch (e) {
        return res.status(500).json({ error: e });
    }
})
router.post('/editFeedSave', (req, res) => {
    try {
        const { id, title, content } = req.body;
        const editById=feedDBInst.updateItem({id, title, content});
        if(editById) return res.status(200).json({ isOK: true });
        else return res.status(500).json({ error: "No item edited" })
    } catch (e) {
        return res.status(500).json({ error: e });
    }
})

module.exports = router;