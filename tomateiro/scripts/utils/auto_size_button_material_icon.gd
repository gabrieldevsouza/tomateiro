extends Button
class_name AutoSizeButtonMaterialIcon

var _icon_name : String
var _icon_size : int

#Resize label vars
@export var max_font_size = 56

var previous_text : String = ""

@export var icon_name := "image-outline":
	set(value):
		_set_icon_name(value)
	get:
		return _icon_name

# @export_range(16, 128, 1)
# var icon_size := 16:
# 	set(value):
# 		_set_icon_size(value)
# 	get:
# 		return _icon_size

func _ready():
	clip_text = false
	clip_text = true
	var font := MaterialIconsDB.font
	set("theme_override_fonts/font", font)

func _set_icon_name(value: String):
	if !Engine.is_editor_hint():
		await ready
	_icon_name = value
	text = MaterialIconsDB.get_icon_char(value)

# func _set_icon_size(value: int):
# 	if !Engine.is_editor_hint():
# 		await ready
# 	_icon_size = value
# 	set("theme_override_font_sizes/font_size", value)

func _process(_delta: float) -> void:
	if previous_text != text:
		update_font_size()
		previous_text = text

func _set(property: StringName, _value: Variant) -> bool:
	match property:
		"text":
			update_font_size()

	return false

func _draw() -> void:
	update_font_size()

func update_font_size() -> void:
	await get_tree().create_timer(0.01).timeout

	var font = get_theme_font("font")
	var font_size = get_theme_font_size("font_size")

	var line = TextLine.new()
	line.direction = text_direction
	line.flags = TextServer.JUSTIFICATION_NONE
	line.alignment = HORIZONTAL_ALIGNMENT_CENTER

	for i in 20:
		line.clear()
		var created = line.add_string(text, font, font_size)
		if created:
			var text_size_x = line.get_line_width()
			var lines_needed = ceil(text_size_x / size.x)
			var text_size_y = font.get_height(font_size) * lines_needed 


			if text_size_y + 3 > floor(size.y) and font_size > 1: 
				font_size -= 1
			elif text_size_x + 3 > floor(size.x) and font_size > 1:
				font_size -= 1
			elif font_size < max_font_size:
				font_size += 1
			else:
				break
				
		else:
			push_warning('Could not create a string')
			break

		add_theme_font_size_override("font_size", font_size)
