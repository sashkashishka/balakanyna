-- Custom SQL migration file, put you code below! --
UPDATE `task`
SET type = 'iframeViewer'
WHERE type = 'wordwall';
