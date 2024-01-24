const Contact = require("../models/contactDB");
const contactSchema = require("../schemas/contact");
const favoriteSchema = require("../schemas/favorite");

const ObjectId = require("mongoose").Types.ObjectId;

async function getContacts(req, res, next) {
  try {
    const contacts = await Contact.find();

    res.send(contacts);
  } catch (error) {
    next(error);
  }
}

async function getContactById(req, res, next) {
  const { contactId } = req.params;
  const idCheck = ObjectId.isValid(contactId);
  if (!idCheck) {
    return res
      .status(400)
      .send({ message: "Invalid id, id must be a 24 character hex string" });
  }
  try {
    const contact = await Contact.findById(contactId);
    console.log("Contact", contact);
    if (contact === null) {
      return res.status(404).send({ message: "Contact not found" });
    }

    res.send(contact);
  } catch (error) {
    next(error);
  }
}

async function createContact(req, res, next) {
  const response = contactSchema.validate(req.body, { abortEarly: false });
  if (response.error) {
    return res.status(400).send({
      message: `missing ${response.error.details
        .map((err) => err.message)
        .join(", ")} field`,
    });
  }

  const contact = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };

  try {
    const result = await Contact.create(contact);

    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
}

async function deleteContact(req, res, next) {
  const { contactId } = req.params;
  const idCheck = ObjectId.isValid(contactId);
  if (!idCheck) {
    return res
      .status(400)
      .send({ message: "Invalid id, id must be a 24 character hex string" });
  }
  try {
    const contact = await Contact.findByIdAndDelete(contactId);

    if (contact === null) {
      return res.status(404).send({ message: "Contact not found" });
    }

    res.send(contact);
  } catch (error) {
    next(error);
  }
}

async function updateContact(req, res, next) {
  const { contactId } = req.params;
  const idCheck = ObjectId.isValid(contactId);
  if (!idCheck) {
    return res
      .status(400)
      .send({ message: "Invalid id, id must be a 24 character hex string" });
  }
  try {
    const contact = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    };

    const newContact = await Contact.findByIdAndUpdate(contactId, contact, {
      new: true,
    });
    if (newContact === null) {
      res.status(404).send({ message: "contact not found" });
    }
    console.log("NEW CONTACT", newContact);
    res.send(newContact);
  } catch (error) {
    next(error);
  }
}

async function updateStatusContact(req, res, next) {
  const response = favoriteSchema.validate(req.body, { abortEarly: false });
  if (response.error) {
    console.log("ERROR", response.error.details);
    return res.status(400).send({
      message: `${response.error.details.map((msg) => msg.message)}`,
    });
  }

  const { contactId } = req.params;
  const idCheck = ObjectId.isValid(contactId);
  if (!idCheck) {
    return res
      .status(400)
      .send({ message: "Invalid id, id must be a 24 character hex string" });
  }
  try {
    const result = await Contact.findByIdAndUpdate(
      contactId,
      {
        favorite: req.body.favorite,
      },
      { new: true }
    );

    if (result === null) {
      return res.status(404).send({ message: "Contact not found" });
    }
    res.send(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getContacts,
  getContactById,
  createContact,
  deleteContact,
  updateContact,
  updateStatusContact,
};
