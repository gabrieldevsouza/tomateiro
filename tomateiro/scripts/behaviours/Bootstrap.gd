extends Node
class_name Bootstrap

@export var main_area_spawn_point : Node
@export var main_area : PackedScene

@export var cycle_time : CycleTimeController
@export var round_controller : RoundController

@export var iteration_tick : IterationTick

@export var main_control : Control


##
var window_size : Vector2 = Vector2.ZERO
var window_position : Vector2 = Vector2.ZERO
var was_window_pinned : bool = false
var was_window_saved : bool = false
##

func _ready() -> void:
	bootstrap()

func bootstrap() -> void:
	var main_area_instance = main_area.instantiate()
	main_area_instance.name = "MainArea"
	main_area_spawn_point.add_child(main_area_instance)

	round_controller.bootstrap()
	cycle_time.bootstrap()
	iteration_tick.bootstrap()

	prepare()

	cycle_time.play_signal.connect(on_play)
	cycle_time.finish_signal.connect(on_finish)


func prepare() -> void:
	save_window()
	cycle_time.prepare()

func _process(delta):
	# print(main_control.get_global_mouse_position())
	pass

func is_mouse_button_pressed() -> bool:
	return false
	print(Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT))

func on_play() -> void:
	if not round_controller.is_focus_cycle():
		save_window()
		window_cover_screen()
		DisplayServer.window_set_position(Vector2(-10, -10))
		get_window().always_on_top = true
		

func on_finish() -> void:
	if round_controller.is_focus_cycle():
		print ("on_finish")
		get_window().always_on_top = was_window_pinned
		DisplayServer.window_set_position(window_position)
		DisplayServer.window_set_size(window_size)

func save_window() -> void:
	window_size = get_window().size
	window_position = get_window().position
	was_window_pinned = get_window().always_on_top

func window_cover_screen() -> void:
	var current_monitor = get_window().get_current_screen()
	var monitors_count = DisplayServer.get_screen_count()
	var screen_size = DisplayServer.screen_get_size(current_monitor)
	DisplayServer.window_set_size(Vector2((screen_size.x * monitors_count) + 20 , screen_size.y + 20))
