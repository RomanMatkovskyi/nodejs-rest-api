const express = require("express");
const Contacts = require("../../models/contacts");
const contactSchema = require("../../schemas/contact.js");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const contacts = await Contacts.listContacts();
    res.send(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await Contacts.getContactById(contactId);
    if (!contact) {
      return res.status(404).send('"message": "Not found"');
    }
    res.send(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const response = contactSchema.validate(req.body, { abortEarly: false });
  if (response.error) {
    return res.status(400).send({
      message: `missing required ${response.error.details
        .map((err) => err.message)
        .join(", ")} field`,
    });
  }
  try {
    const contact = await Contacts.addContact(req.body);
    res.status(201).send(contact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await Contacts.removeContact(contactId);
    if (contact === null) {
      return res.status(404).send({ message: "Not found" });
    }
    res.send({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const response = contactSchema.validate(req.body, { abortEarly: false });
  if (response.error) {
    return res.status(400).send({
      message: `missing required ${response.error.details
        .map((err) => err.message)
        .join(", ")} field`,
    });
  }
  try {
    const contact = await Contacts.updateContact(contactId, req.body);
    if (contact === null) {
      return res.status(404).send({ message: "Not found" });
    }
    res.send(contact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
