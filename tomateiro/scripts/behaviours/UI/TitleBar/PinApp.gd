extends Button

@export var style_disabled : StyleBox
@export var style_enabled : StyleBox

var is_pinned : bool = false

func _ready() -> void:
	is_pinned = get_window().always_on_top
	setup_style()
	

func _on_pressed() -> void:
	get_window().always_on_top = !get_window().always_on_top
	is_pinned = get_window().always_on_top
	setup_style()

func setup_style() -> void:
	if is_pinned:
		add_theme_stylebox_override("normal", style_enabled)
	else:
		add_theme_stylebox_override("normal", style_disabled)