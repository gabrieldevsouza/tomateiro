@tool
extends Button
class_name AutoSizeMaterialButton

var _icon_name : String

var previous_text : String = ""

var must_skip : bool = false

@export var size_margin : int = 10
@export var max_steps = 30

@export var icon_name := "image-outline":
	set(value):
		_set_icon_name(value)
	get:
		return _icon_name

func _ready():
	clip_text = true
	var font := MaterialIconsDB.font
	set("theme_override_fonts/font", font)

	set_font_size(1)
	

func _set_icon_name(value: String):
	if !Engine.is_editor_hint():
		await ready
	_icon_name = value
	text = MaterialIconsDB.get_icon_char(value)


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

	var font_theme = get_theme_font("font_theme")
	var font_size = get_theme_font_size("font_size")

	var line = TextLine.new()
	line.direction = text_direction
	line.flags = TextServer.JUSTIFICATION_NONE
	line.alignment = HORIZONTAL_ALIGNMENT_CENTER


	################
	
	var target_size = 1
	for i in max_steps:
		line.clear()
		var created = line.add_string(text, font_theme, font_size)
		if created:

			if size.y > size.x:
				target_size = floor(floor(size.x)) - size_margin
			else:
				target_size = floor(floor(size.y)) - size_margin

			font_size = max(target_size, 1)
				
	
	must_skip = false
	add_theme_font_size_override("font_size", font_size)
