extends FloatVar
class_name FloatOffsetVar

@export var base : FloatVar

func get_value() -> float:
	return base.get_value() + value
