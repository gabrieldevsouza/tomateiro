extends Resource
class_name RoundController

@export var cycle_time : CycleTimeController

@export var setup_focus_max_amount : IntVar

var real_cycles_amount : int = 0
var current_cycle : int = 0

func bootstrap() -> void:

	load_resources()

	real_cycles_amount = setup_focus_max_amount.value * 2


func load_resources() -> void:
	setup_focus_max_amount = ResourceLoader.load("user://setup_focus_max_amount.tres")

	if setup_focus_max_amount == null:
		setup_focus_max_amount = IntVar.new()
		setup_focus_max_amount.value = 0

func prepare() -> void:
	cycle_time.allow_user_play = true
