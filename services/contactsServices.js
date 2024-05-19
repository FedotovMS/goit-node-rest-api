import Contact from "../models/Contact.js";

function getContactsList(search = {}) {
  const { filter = {}, fields = "", settings = {} } = search;

  return Contact.find(filter, fields, settings).populate(
    "owner",
    "username email"
  );
}
function countContacts(filter) {
  return Contact.countDocuments(filter);
}
async function getContactById(filter) {
  const result = Contact.findOne(filter);
  return result;
}

function removeContact(filter) {
  return Contact.findOneAndDelete(filter);
}

function updateContactById(filter, data) {
  return Contact.findOneAndUpdate(filter, data);
}

function addContact(data) {
  return Contact.create(data);
}

function patchFavorite(id, data) {
  return Contact.findByIdAndUpdate(id, data);
}

export {
  getContactsList,
  countContacts,
  getContactById,
  removeContact,
  addContact,
  updateContactById,
  patchFavorite,
};
