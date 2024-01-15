const fs = require("fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const contactSchema = require("../schemas/contact");

const { encode } = require("punycode");

const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
  const data = await fs.readFile(contactsPath, { encoding: "utf-8" });

  return JSON.parse(data);
};

async function writeContacts(contact) {
  return fs.writeFile(contactsPath, JSON.stringify(contact, undefined, 2));
}

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const contact = contacts.find((contact) => contact.id === contactId);

  if (contact === undefined) {
    return null;
  }

  return contact;
};

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const index = contacts.findIndex((contact) => contact.id === contactId);

  if (index === -1) {
    return null;
  }

  const newContacts = [
    ...contacts.slice(0, index),
    ...contacts.slice(index + 1),
  ];
  await writeContacts(newContacts);

  return;
};

const addContact = async (body) => {
  const contacts = await listContacts();
  const newContact = { id: crypto.randomUUID(), ...body };

  contacts.push(newContact);
  await writeContacts(contacts);

  return newContact;
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();

  const index = contacts.findIndex((contact) => contactId === contact.id);

  if (index === -1) {
    return null;
  }

  const response = contactSchema.validate(body, { abortEarly: false });
  if (response.error) {
    return {
      message: `missing required ${response.error.details
        .map((err) => err.message)
        .join(", ")} field`,
    };
  }

  const newContact = { id: contactId, ...body };
  const newContacts = [
    ...contacts.slice(0, index),
    newContact,
    ...contacts.slice(index + 1),
  ];
  await writeContacts(newContacts);

  return newContact;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
