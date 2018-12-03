
module.exports = async (req, res) => {
    res.json({success: true, message: "pong"});
    res.locals.log.logSuccess();
};