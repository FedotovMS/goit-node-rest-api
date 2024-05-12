import Contact from "../models/Contact.js";

function getContactsList() {
  return Contact.find({});
}

async function getContactById(contactId) {
  const result = await Contact.findById(contactId);
  return result;
}

function removeContact(contactId) {
  return Contact.findByIdAndDelete(contactId);
}

function updateContactById(id, data) {
  return Contact.findByIdAndUpdate(id, data);
}

function addContact(data) {
  return Contact.create(data);
}

function patchFavorite(id, data) {
  return Contact.findByIdAndUpdate(id, data);
}

export {
  getContactsList,
  getContactById,
  removeContact,
  addContact,
  updateContactById,
  patchFavorite,
};
