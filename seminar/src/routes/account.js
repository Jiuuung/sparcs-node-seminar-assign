const express = require('express');
const authMiddleware = require('../middleware/auth');
const AccountModel = require('../models/account');

const router = express.Router();

class BankDB {
    static _inst_;
    static getInst = () => {
        if ( !BankDB._inst_ ) BankDB._inst_ = new BankDB();
        return BankDB._inst_;
    }


    constructor() { console.log("[Bank-DB] DB Init Completed"); }

    getBalance = async () => {
        try{
            const total = await AccountModel.find();
            return { success: true, data: total };
        } catch (e) {
            console.log(`[Bank-DB] Balance Error: ${e}`);
            return {success: false, data:`Error : ${ e }`}
        }
    }

    transaction = async ( amount ) => {
        try{
            const total = await AccountModel.find();
            const newvalue= Object.values(total)[0].total+amount;
            const final = await AccountModel.updateOne({user:"tom"}, {$set:{total:newvalue }});
            return { success: true, data: newvalue };
        } catch (e) {
            console.log(`[Bank-DB] Transaction Error : ${ e }`);
            return {success: false, data:`Error : ${ e }`};
        }
    }
}

const bankDBInst = BankDB.getInst();

router.post('/getInfo', authMiddleware, async(req, res) => {
    try {
        const { success, data } = await bankDBInst.getBalance();
        const balance= Object.values(data)[0].total;
        console.log(balance);
        if (success) return res.status(200).json({ balance: balance });
        else return res.status(500).json({ error: data });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.post('/transaction', authMiddleware, async (req, res) => {
    try {
        const { amount } = req.body;
        const { success, data } = await bankDBInst.transaction( parseInt(amount) );
        console.log(data);
        if (success) res.status(200).json({ success: true, balance: data, msg: "Transaction success" });
        else res.status(500).json({ error: data })
    } catch (e) {
        return res.status(500).json({ error: e });
    }
})

module.exports = router;