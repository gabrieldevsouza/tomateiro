extends Control

var following : bool = false
var dragging_start_position : Vector2 = Vector2.ZERO
var is_left_mouse_pressed : bool = false

@export var title_bar_content : Control
@export var title_area : Control

@export var cycle_time : CycleTimeController
@export var round_controller : RoundController

@export var timer_to_hide : FloatVar

func _ready():
	cycle_time.play_signal.connect(on_play)
	title_area.gui_input.connect(_on_gui_input)
	title_bar_content.visible = false


func _on_gui_input(event:InputEvent) -> void:
	if (event is InputEventMouseMotion or event is InputEventMouseButton or event is InputEventScreenTouch) and not title_bar_content.visible and round_controller.is_focus_cycle():
		title_bar_content.visible = true
		await get_tree().create_timer(timer_to_hide.get_value()).timeout
		title_bar_content.visible = false

func on_play() -> void:
	title_bar_content.visible = false
	if not round_controller.is_focus_cycle():
		following = false

func _on_main_title_bar_gui_input(event:InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.is_pressed():
				is_left_mouse_pressed = true
				following = true
				dragging_start_position = get_global_mouse_position()
			else:
				following = false


func _process(_delta: float) -> void:
	if not Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		is_left_mouse_pressed = false

	if not is_left_mouse_pressed:
		following = false

	if following:
		var mouse_position = get_global_mouse_position()
		var window_position = Vector2(DisplayServer.window_get_position())
		DisplayServer.window_set_position(window_position + (mouse_position - dragging_start_position))
	
	if not get_window().has_focus() or get_window().mode == DisplayServer.WINDOW_MODE_MINIMIZED:
		is_left_mouse_pressed = false
		following = false
