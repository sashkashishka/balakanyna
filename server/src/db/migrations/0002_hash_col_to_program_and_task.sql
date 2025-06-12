ALTER TABLE `program` ADD `hash` text DEFAULT '';
ALTER TABLE `task` ADD `hash` text DEFAULT '';

UPDATE `program` SET hash = id;
UPDATE `task` SET hash = id;
