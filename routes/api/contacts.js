const express = require("express");

const ContactController = require("../../controllers/contact.js");

const router = express.Router();
const jsonParser = express.json();

router.get("/", ContactController.getContacts);

router.get("/:contactId", ContactController.getContactById);

router.post("/", jsonParser, ContactController.createContact);

router.delete("/:contactId", ContactController.deleteContact);

router.put("/:contactId", jsonParser, ContactController.updateContact);

router.patch(
  "/:contactId/favorite",
  jsonParser,
  ContactController.updateStatusContact
);

module.exports = router;
