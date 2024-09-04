extends Control

var mouse_offset : Vector2 = Vector2.ZERO
var window_start_drag_position : Vector2 = Vector2.ZERO
var window_start_size : Vector2 = Vector2.ZERO

var following : bool = false

enum AnchorType {LEFT, RIGHT, TOP, BOTTOM, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT}

var target_position : Vector2 = Vector2.ZERO
var target_size : Vector2 = Vector2.ZERO

@export var anchor_type : AnchorType = AnchorType.TOP_LEFT

func _ready() -> void:
	target_size = DisplayServer.window_get_size()
	target_position = DisplayServer.window_get_position()

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
			

func _process(_delta: float) -> void:
	if following:
		target_size = DisplayServer.window_get_size()
		target_position = DisplayServer.window_get_position()

		match anchor_type:
			AnchorType.LEFT:
				target_position.x = DisplayServer.window_get_position().x  + get_global_mouse_position().x - mouse_offset.x
				target_size.x = window_start_size.x - (DisplayServer.window_get_position().x - window_start_drag_position.x)

			AnchorType.RIGHT:
				target_position.x = get_global_mouse_position().x

			AnchorType.TOP:
				target_position.y = DisplayServer.window_get_position().y + get_global_mouse_position().y - mouse_offset.y
				target_size.y = window_start_size.y - (DisplayServer.window_get_position().y - window_start_drag_position.y)

			AnchorType.BOTTOM:
				target_position.y = get_global_mouse_position().y

		DisplayServer.window_set_position(target_position)
		DisplayServer.window_set_size(target_size)