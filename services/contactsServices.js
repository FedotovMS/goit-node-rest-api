import Contact from "../models/Contact.js";

function getContactsList() {
  Contact.find();
}

function getContactById(contactId) {}

function removeContact(contactId) {}

function updateContactById(id, data) {}

function addContact(data) {}

export {
  getContactsList,
  getContactById,
  removeContact,
  addContact,
  updateContactById,
};
