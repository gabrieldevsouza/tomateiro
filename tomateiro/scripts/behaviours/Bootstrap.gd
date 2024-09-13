extends Node
class_name Bootstrap

@export var main_area_spawn_point : Node
@export var main_area : PackedScene

@export var cycle_time : CycleTimeController
@export var round_controller : RoundController

@export var iteration_tick : IterationTick

@export var main_control : Control

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


func prepare() -> void:
	cycle_time.prepare()

func _process(delta):
	# print(main_control.get_global_mouse_position())
	pass

func is_mouse_button_pressed() -> bool:
	return false
	print(Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT))
