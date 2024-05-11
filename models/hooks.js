export const handleSaveError = (error, data, next) => {
  error.status = 400;
  next();
};

export const saveUpdatedSettings = function (next) {
  this.getOptions.new = true;
  this.getOptions.runValidators = true;
  next();
};
