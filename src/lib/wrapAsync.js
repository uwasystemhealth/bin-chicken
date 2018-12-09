
module.exports = (fn) => {
    return (req, res, next) => {
      //catches async errors
      fn(req, res, next).catch(next);
    };
};