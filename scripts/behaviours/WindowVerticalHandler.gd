extends Control

var mouse_offset : Vector2 = Vector2.ZERO
var window_position : Vector2 = Vector2.ZERO
var window_size : Vector2 = Vector2.ZERO

var distance_to_edge : float = 0.0

var following : bool = false

var MIN_WINDOW_SIZE : float = 60

@export var beginning : bool = false


func _ready() -> void:
	get_tree().get_root().set_transparent_background(true)
	DisplayServer.window_set_flag(DisplayServer.WINDOW_FLAG_TRANSPARENT, true)
	window_position = Vector2(DisplayServer.window_get_position())
	window_size = Vector2(DisplayServer.window_get_size())

	distance_to_edge = window_size.y - (global_position).y

	print("distance_to_edge: ", distance_to_edge, "  ::  ", (global_position).y)

func _input(event):
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and not event.pressed:
		if Vector2(DisplayServer.window_get_size()).y <= MIN_WINDOW_SIZE:
			DisplayServer.window_set_size(Vector2(DisplayServer.window_get_size().x, MIN_WINDOW_SIZE))
		following = false

func _process(_delta: float) -> void:
	pass
	if following:
		DisplayServer.window_set_size(Vector2(
			DisplayServer.window_get_size().x, 
			get_global_mouse_position().y
		))

		DisplayServer.window_set_position(Vector2(
			DisplayServer.window_get_position().x,
			get_global_mouse_position().y + distance_to_edge
		)

		print(distance_to_edge)

	if Vector2(DisplayServer.window_get_size()).y <= MIN_WINDOW_SIZE:
		DisplayServer.window_set_size(Vector2(DisplayServer.window_get_size().x, MIN_WINDOW_SIZE))
		following = false

func _on_gui_input(event:InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.is_pressed():
				following = true
			elif event.is_released():
				following = false
			elif Vector2(DisplayServer.window_get_size()).y <= MIN_WINDOW_SIZE:
				DisplayServer.window_set_size(Vector2(DisplayServer.window_get_size().x, MIN_WINDOW_SIZE))
				following = false
			else:
				following = false
