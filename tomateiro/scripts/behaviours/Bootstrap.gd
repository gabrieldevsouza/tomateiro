extends Node
class_name Bootstrap

@export var main_area_spawn_point : Node
@export var main_area : PackedScene

@export var cycle_time : CycleTimeController
@export var round_controller : RoundController

@export var iteration_tick : IterationTick

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
	round_controller.prepare()
	cycle_time.prepare()
