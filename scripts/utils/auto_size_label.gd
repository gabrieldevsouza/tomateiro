@tool
class_name AutoSizeLabel extends Label


@export var max_font_size = 56

var can_check_text_change_1 = true
var can_check_text_change_2 = true
var can_check_text_change_3 = true
var can_check_text_change_4 = true
var can_check_text_change = true

var call_again : bool = false

var previous_text : String = ""

func _ready() -> void:
	clip_text = true

func _process(_delta: float) -> void:
	if previous_text != text:
		update_font_size()
		previous_text = text


func _set(property: StringName, _value: Variant) -> bool:
	match property:
		"text":
			update_font_size()

	return false


func update_font_size() -> void:
	print("updating font size")
	await get_tree().create_timer(0.01).timeout

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
			var text_size = line.get_line_width()

			if text_size > floor(size.x):
				font_size -= 1
			elif font_size < max_font_size:
				font_size += 1
			else:
				break
		else:
			push_warning('Could not create a string')
			break

		add_theme_font_size_override("font_size", font_size)


func _draw() -> void:
	update_font_size()