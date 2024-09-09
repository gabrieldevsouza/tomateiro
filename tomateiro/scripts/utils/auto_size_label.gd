@tool
class_name AutoSizeLabel extends Label


@export var max_font_size = 56

var previous_text : String = ""

func _ready() -> void:
	clip_text = true
	set_font_size(1)

# func _process(_delta: float) -> void:
# 	if previous_text != text:
# 		update_font_size()
# 		previous_text = text


func _set(property: StringName, _value: Variant) -> bool:
	match property:
		"text":
			update_font_size()

	return false

func _draw() -> void:
	update_font_size()

func update_font_size() -> void:
	await get_tree().create_timer(0.01).timeout

	clip_text = true

	var font = get_theme_font("font")
	var font_size = get_theme_font_size("font_size")

	var line = TextLine.new()
	line.direction = text_direction
	line.flags = justification_flags
	line.alignment = horizontal_alignment

	for i in 20:
		line.clear()
		var created = line.add_string(text, font, font_size)
		if created:
			var text_size_x = line.get_line_width()
			var lines_needed = ceil(text_size_x / size.x)
			var text_size_y = font.get_height(font_size) * lines_needed 


			if text_size_x + 3 > floor(size.x):
				font_size -= 1
			elif text_size_y + 3 > floor(size.y):
				font_size -= 1
			elif font_size < max_font_size:
				font_size += 1
			else:
				break
				
		else:
			push_warning('Could not create a string')
			break

		add_theme_font_size_override("font_size", font_size)


func set_font_size(font_size : int) -> void:
	add_theme_font_size_override("font_size", font_size)