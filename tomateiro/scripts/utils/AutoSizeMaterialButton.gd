@tool
extends Button
class_name AutoSizeMaterialButton

var _icon_name : String
# var _icon_size : int

#Resize label vars

var previous_text : String = ""

var must_skip : bool = false

@export var size_margin : int = 10
@export var max_steps = 30

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
	# if previous_text != text:
	# 	update_font_size()
	# 	previous_text = text
	pass

func _set(property: StringName, _value: Variant) -> bool:
	match property:
		"text":
			if !must_skip:
				must_skip = true
			update_font_size()

	return false

func _draw() -> void:
	if !must_skip:
		must_skip = true
		return
	
	update_font_size()
	
	# print("draw")

func set_font_size(font_size : int) -> void:
	add_theme_font_size_override("font_size", font_size)

func get_font_size() -> int:
	return get_theme_font_size("font_size")

func update_font_size() -> void:
	
	var scene_tree : SceneTree = get_tree()

	if scene_tree != null:
		var timer : SceneTreeTimer = get_tree().create_timer(0.01)

		if timer != null:
			await timer.timeout

	var font = get_theme_font("font")
	var font_size = get_theme_font_size("font_size")

	var line = TextLine.new()
	line.direction = text_direction
	line.flags = TextServer.JUSTIFICATION_NONE
	line.alignment = HORIZONTAL_ALIGNMENT_CENTER


	################
	
	for i in max_steps:
		line.clear()
		var created = line.add_string(text, font, font_size)
		if created:
			var target_size = 1

			if size.y > size.x:
				target_size = floor(floor(size.x)) - size_margin
			else:
				target_size = floor(floor(size.y)) - size_margin

			font_size = max(target_size, 1)
				
	
	must_skip = false
	add_theme_font_size_override("font_size", font_size)
