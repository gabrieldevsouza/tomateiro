extends Resource
class_name RoundController

@export var cycle_time : CycleTimeController

@export var setup_focus_max_amount : IntVar

var real_cycles_amount : int = 0
var current_cycle : IntVar

func bootstrap() -> void:

	load_resources()

	cycle_time.finish_signal.connect(on_finish)

	real_cycles_amount = setup_focus_max_amount.value * 2
	print("real_cycles_amount: ", real_cycles_amount)


func load_resources() -> void:
	current_cycle = ResourceLoader.load("user://setup_focus_max_amount.tres")

	if current_cycle == null:
		current_cycle = IntVar.new()
		current_cycle.value = 1

func prepare() -> void:
	current_cycle.value = 1
	change_user_play()

func can_user_play() -> bool:
	return current_cycle.get_value() % 2 != 0

func change_user_play() -> void:
	cycle_time.allow_user_play = can_user_play()
	print(current_cycle, " ", can_user_play())

func on_finish() -> void:
	current_cycle.value += 1
	change_user_play()

	print("")
	print(current_cycle.get_value(), " ", current_cycle.get_value() % 2)

	if current_cycle.get_value() > real_cycles_amount:
		current_cycle.value = 1
		print(current_cycle.get_value(), " ", real_cycles_amount)
	elif current_cycle.get_value() % 2 == 0:
		cycle_time.repeat()
		cycle_time.play()
