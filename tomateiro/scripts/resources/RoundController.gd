extends Resource
class_name RoundController

@export var setup_focus_max_cycle_amount : IntVar

@export var setup_focus_time : FloatVar
@export var setup_rest_time : FloatVar

var current_cycle_time : float = 0

var real_cycles_amount : int = 0
var current_cycle : IntVar

func bootstrap() -> void:

	load_resources()

	real_cycles_amount = setup_focus_max_cycle_amount.value * 2

	setup_current_cycle_time()


func load_resources() -> void:
	current_cycle = ResourceLoader.load("user://setup_focus_max_cycle_amount.tres")

	if current_cycle == null:
		current_cycle = IntVar.new()
		current_cycle.value = 1

func iterate_cycle() -> void:
	current_cycle.value += 1

	if current_cycle.get_value() > real_cycles_amount:
		current_cycle.value = 1

	setup_current_cycle_time()

func setup_current_cycle_time() -> void:
	if current_cycle.get_value() % 2 == 1:
		current_cycle_time = setup_focus_time.value
		print("Focus Time: ", current_cycle_time, " ", current_cycle.get_value())
	else:
		current_cycle_time = setup_rest_time.value
		print("Rest Time: ", current_cycle_time, " ", current_cycle.get_value())

func prepare_next_cycle() -> void:

	iterate_cycle()

func can_user_play() -> bool:
	return current_cycle.get_value() % 2 != 0
