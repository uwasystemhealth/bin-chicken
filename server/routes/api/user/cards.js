const app = require('../../../app');

module.exports = {
    async find(req, res){
        const cards = await app.models.Token.find({type: 'card', owner: res.locals.user._id}).whereValid();
        res.json({
            success: true,
            cards: cards.map((card) => {return {
                cardId: card._id, 
                name: card.name, 
                createdAt: card.createdAt,
                updatedAt: card.updatedAt,
            }; }),
        });
        res.locals.log.logSuccess({data: {cards: cards.map((card)=>card._id)}});
    },
    async get(req, res){
        const card = await app.models.Token.findOne({_id: req.params.cardId, type: 'card', owner: res.locals.user._id}).whereValid();
        if(!card) throw new app.errors.CardNotFound();
        res.json({
            success: true,
            card: {
                cardId: card._id, 
                name: card.name, 
                createdAt: card.createdAt,
                updatedAt: card.updatedAt,
            },
        });
        res.locals.log.logSuccess({data: {card: card._id}});
    },
    async create(req, res){
        let validCount = await app.models.Token.count({type: 'card', owner: res.locals.user._id}).whereValid();
        if(validCount >= 3) throw new app.errors.MaxCardsReached();

        let invalidCount = await app.models.Token.count({type: 'card', owner: res.locals.user._id});
        let name = req.body.name || 'card '.concat(invalidCount+1);

        const card = await app.models.Token.createToken(res.locals.user._id, name, 16, {type: 'card'});
        res.json({
            success: true,
            card: {
                cardId: card._id,
                key: card.token,
                name: card.name, 
                createdAt: card.createdAt,
                updatedAt: card.updatedAt,
            },
        });
        res.locals.log.logSuccess({data: {card: card._id}});
    },
    async patch(req, res){
        const card = await app.models.Token.findOne({_id: req.params.cardId, type: 'card', owner: res.locals.user._id}).whereValid();
        if(!card) throw new app.errors.CardNotFound();
        
        card.name = req.body.name;
        await card.save();
        
        res.json({
            success: true,
            card: {
                cardId: card._id,
                name: card.name,
                createdAt: card.createdAt,
                updatedAt: card.updatedAt,
            },
        });
        res.locals.log.logSuccess({data: {card: card._id}});
    },
    async delete(req, res){
        const card = await app.models.Token.findOne({_id: req.params.cardId, type: 'card', owner: res.locals.user._id}).whereValid();
        if(!card) throw new app.errors.CardNotFound();

        await card.safeRemove();

        res.json({
            success: true,
            card: {
                cardId: card._id, 
                name: card.name, 
                createdAt: card.createdAt,
                updatedAt: card.updatedAt,
            },
        });
        res.locals.log.logSuccess({data: {card: card._id}});
    },
};