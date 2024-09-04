extends Control

var mouse_offset : Vector2 = Vector2.ZERO
var window_start_drag_position : Vector2 = Vector2.ZERO
var window_start_size : Vector2 = Vector2.ZERO

var following : bool = false

func _ready():
	get_viewport().transparent_bg = true
	DisplayServer.window_set_flag(DisplayServer.WINDOW_FLAG_TRANSPARENT, true)

func _process(_delta: float) -> void:
	if following:
		DisplayServer.window_set_position(Vector2(
			DisplayServer.window_get_position().x  + get_global_mouse_position().x - mouse_offset.x,
			DisplayServer.window_get_position().y + get_global_mouse_position().y - mouse_offset.y
		))

		DisplayServer.window_set_size(Vector2(
			window_start_size.x - (DisplayServer.window_get_position().x - window_start_drag_position.x),
			window_start_size.y - (DisplayServer.window_get_position().y - window_start_drag_position.y)
		))

func _input(event):
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and not event.pressed:
		following = false

func _on_gui_input(event:InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.is_pressed():
				following = true
				mouse_offset = get_global_mouse_position()
				window_start_drag_position = DisplayServer.window_get_position()
				window_start_size = DisplayServer.window_get_size()
			elif event.is_released():
				following = false