extends Control

@export var top_anchor : Control
@export var bottom_anchor : Control
@export var left_anchor : Control
@export var right_anchor : Control

var mouse_offset : Vector2 = Vector2.ZERO

var following : bool = false

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta: float) -> void:
	if following:
		DisplayServer.window_set_position(Vector2(
			DisplayServer.window_get_position().x + get_global_mouse_position().x - mouse_offset.x,
			DisplayServer.window_get_position().y
		))



func _on_control_top_gui_input(event:InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.is_pressed():
				following = true
				mouse_offset = get_global_mouse_position()


func _on_control_t_gui_input(event: InputEvent) -> void:
	pass # Replace with function body.
