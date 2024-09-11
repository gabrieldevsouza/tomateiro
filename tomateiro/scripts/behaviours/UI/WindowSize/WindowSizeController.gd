extends Control

var mouse_offset : Vector2 = Vector2.ZERO
var window_start_drag_position : Vector2 = Vector2.ZERO
var window_start_size : Vector2 = Vector2.ZERO

var following : bool = false

enum AnchorType {LEFT, RIGHT, TOP, BOTTOM, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT}

var target_position : Vector2 = Vector2.ZERO
var target_size : Vector2 = Vector2.ZERO

@export var anchor_type : AnchorType = AnchorType.LEFT

func _ready() -> void:
	target_size = DisplayServer.window_get_size()
	target_position = DisplayServer.window_get_position()

	gui_input.connect(_on_gui_input)

func _input(event):
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		if event.is_released() or not event.pressed:
			following = false
	
	if not Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
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
		
		if anchor_type == AnchorType.LEFT or anchor_type == AnchorType.TOP_LEFT or anchor_type == AnchorType.BOTTOM_LEFT:
			target_position.x = DisplayServer.window_get_position().x  + get_global_mouse_position().x - mouse_offset.x
			target_size.x = window_start_size.x - (DisplayServer.window_get_position().x - window_start_drag_position.x)

		if anchor_type == AnchorType.RIGHT or anchor_type == AnchorType.TOP_RIGHT or anchor_type == AnchorType.BOTTOM_RIGHT:
			target_size.x = get_global_mouse_position().x

		if anchor_type == AnchorType.TOP or anchor_type == AnchorType.TOP_LEFT or anchor_type == AnchorType.TOP_RIGHT:
			target_position.y = DisplayServer.window_get_position().y + get_global_mouse_position().y - mouse_offset.y
			target_size.y = window_start_size.y - (DisplayServer.window_get_position().y - window_start_drag_position.y)

		if anchor_type == AnchorType.BOTTOM or anchor_type == AnchorType.BOTTOM_LEFT or anchor_type == AnchorType.BOTTOM_RIGHT:
			target_size.y = get_global_mouse_position().y

		DisplayServer.window_set_position(target_position)
		DisplayServer.window_set_size(target_size)


	if not get_window().has_focus() or get_window().mode == DisplayServer.WINDOW_MODE_MINIMIZED:
		following = false
	