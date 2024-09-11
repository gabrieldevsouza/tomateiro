extends Control

var following : bool = false
var dragging_start_position : Vector2 = Vector2.ZERO

func _on_main_title_bar_gui_input(event:InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.is_pressed():
				following = true
				dragging_start_position = get_global_mouse_position()
			else:
				following = false


func _process(_delta: float) -> void:
	if following:
		var mouse_position = get_global_mouse_position()
		var window_position = Vector2(DisplayServer.window_get_position())
		DisplayServer.window_set_position(window_position + (mouse_position - dragging_start_position))
