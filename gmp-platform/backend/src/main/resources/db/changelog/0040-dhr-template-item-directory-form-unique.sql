CREATE UNIQUE INDEX IF NOT EXISTS uk_dhr_template_item_directory_form
ON dhr_template_item(directory_id, form_template_id)
WHERE form_template_id IS NOT NULL;
