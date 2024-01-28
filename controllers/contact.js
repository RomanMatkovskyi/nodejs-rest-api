const Contact = require("../models/contactDB");
const contactSchema = require("../schemas/contact");
const favoriteSchema = require("../schemas/favorite");


async function getContacts(req, res, next) {
  try {
    const userId = req.user.id;
    const contacts = await Contact.find({ owner: userId });

    res.send(contacts);
  } catch (error) {
    next(error);
  }
}

async function getContactById(req, res, next) {
  const { contactId } = req.params;
  try {
    const contact = await Contact.findById(contactId);
    if (contact === null) {
      return res.status(404).send({ message: "Contact not found" });
    }


    if (typeof contact.owner === "undefined") {
      return res.status(404).send({ message: "Contact not found" });
    }
    if (contact.owner.toString() !== req.user.id) {
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
      message: `missing required ${response.error.details
        .map((err) => err.message)
        .join(", ")} field`,
    });
  }

  const contact = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,

    owner: req.user.id,
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

  try {
    const contact = await Contact.findByIdAndDelete(contactId);

    if (contact === null) {
      return res.status(404).send({ message: "Contact not found" });
    }


    if (typeof contact.owner === "undefined") {
      return res.status(404).send({
        message: "Contact not found",
      });
    }

    if (contact.owner.toString() !== req.user.id) {
      return res.status(404).send({ message: "Contact not found" });
    }
    res.send(contact);
  } catch (error) {
    next(error);
  }
}

async function updateContact(req, res, next) {
  const { contactId } = req.params;

  const { name, email, phone } = req.body;
  try {
    if (
      typeof name === "undefined" &&
      typeof email === "undefined" &&
      typeof phone === "undefined"
    ) {
      return res
        .status(400)
        .send({ message: "You have to update at least field" });
    }

    const contactCheck = await Contact.findById(contactId);
    if (contactCheck === null) {
      return res.status(404).send({
        message: "Contact not found",
      });
    }

    if (typeof contactCheck.owner === "undefined") {
      return res.status(404).send({
        message: "Contact not found",
      });
    }

    if (contactCheck.owner.toString() !== req.user.id) {
      return res.status(404).send({
        message: "Contact not found",
      });
    }

    const updContact = {
      name: name,
      email: email,
      phone: phone,
    };

    const newContact = await Contact.findByIdAndUpdate(contactId, updContact, {
      new: true,
    });
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

  try {
    const contactCheck = await Contact.findById(contactId);
    if (contactCheck === null) {
      return res.status(404).send({
        message: "Contact not found",
      });
    }

    if (typeof contactCheck.owner === "undefined") {
      return res.status(404).send({
        message: "Contact not found",
      });
    }

    if (contactCheck.owner.toString() !== req.user.id) {
      return res.status(404).send({
        message: "Contact not found",
      });
    }

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
